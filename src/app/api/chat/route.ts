import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, Message } from 'ai';
import { createClient } from '@/lib/supabase/server';
import { getToday, getLast30Days } from '@/lib/utils';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Validation schema for incoming messages
const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(4000),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(50),
});

interface StepsRecord {
  date: string;
  minutes: number;
}

interface WeightRecord {
  recorded_at: string;
  weight: number;
}

interface UserSettings {
  daily_walking_minutes_goal: number;
  weekly_goal_days: number;
  weight_unit: string;
}

async function getUserContext(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never, userId: string) {
  const last30Days = getLast30Days();
  const oldestDate = last30Days[0];

  const [settingsResult, walkingResult, weightResult, gamificationResult] = await Promise.all([
    supabase
      .from('weight_tracker_settings')
      .select('daily_walking_minutes_goal, weekly_goal_days, weight_unit')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('steps_records')
      .select('date, minutes')
      .eq('user_id', userId)
      .gte('date', oldestDate)
      .order('date', { ascending: false })
      .limit(30),
    supabase
      .from('weight_records')
      .select('recorded_at, weight')
      .eq('user_id', userId)
      .gte('recorded_at', oldestDate)
      .order('recorded_at', { ascending: false })
      .limit(30),
    supabase
      .from('user_gamification')
      .select('total_xp, level, current_streak, longest_streak, total_walking_minutes_logged, total_challenges_completed')
      .eq('user_id', userId)
      .single(),
  ]);

  const settings: UserSettings = settingsResult.data ?? {
    daily_walking_minutes_goal: 30,
    weekly_goal_days: 5,
    weight_unit: 'kg',
  };

  const walkingRecords: StepsRecord[] = walkingResult.data ?? [];
  const weightRecords: WeightRecord[] = weightResult.data ?? [];
  const gamification = gamificationResult.data;

  // Calculate summary stats
  const totalWalkingMinutes = walkingRecords.reduce((sum, r) => sum + r.minutes, 0);
  const avgWalkingMinutes = walkingRecords.length > 0 
    ? Math.round(totalWalkingMinutes / walkingRecords.length) 
    : 0;
  
  const daysMetGoal = walkingRecords.filter(r => r.minutes >= settings.daily_walking_minutes_goal).length;

  // Weight change calculation
  let weightChange = '';
  if (weightRecords.length >= 2) {
    const latest = weightRecords[0].weight;
    const oldest = weightRecords[weightRecords.length - 1].weight;
    const diff = latest - oldest;
    weightChange = diff > 0 
      ? `עלייה של ${diff.toFixed(1)} ${settings.weight_unit}` 
      : diff < 0 
        ? `ירידה של ${Math.abs(diff).toFixed(1)} ${settings.weight_unit}`
        : 'ללא שינוי';
  }

  return {
    settings,
    walkingRecords,
    weightRecords,
    gamification,
    summary: {
      totalWalkingMinutes,
      avgWalkingMinutes,
      daysMetGoal,
      weightChange,
    },
  };
}

function buildSystemPrompt(context: Awaited<ReturnType<typeof getUserContext>>) {
  const { settings, walkingRecords, weightRecords, gamification, summary } = context;

  const walkingDataStr = walkingRecords.length > 0
    ? walkingRecords.slice(0, 10).map(r => `${r.date}: ${r.minutes} דקות`).join('\n')
    : 'אין נתונים עדיין';

  const weightDataStr = weightRecords.length > 0
    ? weightRecords.slice(0, 10).map(r => `${r.recorded_at.split('T')[0]}: ${r.weight} ${settings.weight_unit}`).join('\n')
    : 'אין נתונים עדיין';

  const gamificationStr = gamification
    ? `
רמה נוכחית: ${gamification.level}
נקודות XP: ${gamification.total_xp}
סטריק נוכחי: ${gamification.current_streak} ימים
סטריק שיא: ${gamification.longest_streak} ימים
סה"כ דקות הליכה שתועדו: ${gamification.total_walking_minutes_logged}
אתגרים שהושלמו: ${gamification.total_challenges_completed}`
    : 'המשתמש עדיין לא התחיל לצבור נקודות';

  return `אתה "קושר" - עוזר אישי חכם וידידותי לאפליקציית בריאות שעוזרת למשתמשים לעקוב אחר הליכה ומשקל.

## תפקידך
- לתת המלצות מותאמות אישית בהתבסס על הנתונים של המשתמש
- לעודד ולהניע את המשתמש להמשיך בדרך הבריאה
- לענות על שאלות בנושאי בריאות, כושר והרגלי חיים בריאים
- לחגוג הישגים ולעזור להתמודד עם אתגרים

## הגדרות המשתמש
- יעד הליכה יומי: ${settings.daily_walking_minutes_goal} דקות
- יעד ימים בשבוע: ${settings.weekly_goal_days} ימים
- יחידת משקל: ${settings.weight_unit}

## נתוני גיימיפיקציה
${gamificationStr}

## סיכום 30 הימים האחרונים
- סה"כ דקות הליכה: ${summary.totalWalkingMinutes}
- ממוצע יומי: ${summary.avgWalkingMinutes} דקות
- ימים שהושג היעד: ${summary.daysMetGoal} מתוך ${walkingRecords.length}
- שינוי במשקל: ${summary.weightChange || 'אין מספיק נתונים'}

## פעילות הליכה אחרונה (עד 10 רשומות)
${walkingDataStr}

## רשומות משקל אחרונות (עד 10 רשומות)
${weightDataStr}

## תאריך נוכחי
${getToday()}

## הנחיות חשובות
1. **שפה**: ענה תמיד בעברית בלבד
2. **גישה**: היה חיובי, מעודד, אמפתי ותומך
3. **דיוק**: אל תמציא נתונים - אם אין מידע, אמור זאת בכנות
4. **תמציתיות**: שמור על תשובות ממוקדות וקלות לקריאה
5. **הקשר**: התייחס לנתונים האמיתיים של המשתמש כשרלוונטי
6. **בטיחות**: אם יש שאלה רפואית רצינית, המלץ לפנות לרופא
7. **עידוד**: חגוג הצלחות קטנות ותן מוטיבציה להמשיך`;
}

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validationResult = requestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'בקשה לא תקינה',
          details: validationResult.error.issues 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { messages } = validationResult.data;

    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'יש להתחבר כדי להשתמש בצ\'אט' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user context
    const context = await getUserContext(supabase, user.id);

    // Build system prompt
    const systemPrompt = buildSystemPrompt(context);

    // Check API key at runtime
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    console.log('ENV keys:', Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('OPENAI')));
    console.log('API Key value:', apiKey ? `Found (${apiKey.length} chars)` : 'NOT FOUND');
    
    if (!apiKey) {
      console.error('GOOGLE_GENERATIVE_AI_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'שגיאת קונפיגורציה בשרת' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Google AI client inside handler (ensures env vars are loaded)
    const google = createGoogleGenerativeAI({ apiKey });

    // Stream the response using Gemini
    const result = await streamText({
      model: google('gemini-2.0-flash'),
      system: systemPrompt,
      messages: messages as Message[],
      temperature: 0.7,
      maxTokens: 1000,
    });

    // Convert to streaming response
    return new Response(result.textStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Check for specific error types
    if (error instanceof SyntaxError) {
      return new Response(
        JSON.stringify({ error: 'פורמט הבקשה אינו תקין' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'אירעה שגיאה בשרת. אנא נסה שוב מאוחר יותר.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
