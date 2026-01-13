'use client'

import { useState, useMemo } from 'react'
import { Plus, TrendingUp, TrendingDown, Minus, Trash2, Edit } from 'lucide-react'
import { useWeight } from '@/hooks/useSupabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { WeightEntryModal } from '@/components/weight/WeightEntryModal'
import { WeightChart } from '@/components/weight/WeightChart'
import { formatDate, calculateMovingAverage } from '@/lib/utils'
import type { Tables } from '@/types/database'

type TimeRange = '7' | '30' | '90' | '365'

export default function WeightPage() {
  const { weights, refetch, deleteWeight } = useWeight()
  const [timeRange, setTimeRange] = useState<TimeRange>('30')
  const [showModal, setShowModal] = useState(false)
  const [editRecord, setEditRecord] = useState<Tables<'weight_records'> | undefined>()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filteredWeights = useMemo(() => {
    const daysAgo = parseInt(timeRange)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - daysAgo)
    
    return weights.filter(w => new Date(w.recorded_at) >= cutoff)
  }, [weights, timeRange])

  const chartData = useMemo(() => {
    const data = filteredWeights
      .map(w => ({
        date: w.recorded_at.split('T')[0],
        value: Number(w.weight),
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return calculateMovingAverage(data, 7)
  }, [filteredWeights])

  const stats = useMemo(() => {
    if (filteredWeights.length === 0) return null

    const latest = Number(filteredWeights[0]?.weight || 0)
    const oldest = Number(filteredWeights[filteredWeights.length - 1]?.weight || 0)
    const change = Number((latest - oldest).toFixed(1))

    // Calculate averages
    const sum = filteredWeights.reduce((acc, w) => acc + Number(w.weight), 0)
    const average = Number((sum / filteredWeights.length).toFixed(1))

    return { latest, change, average, count: filteredWeights.length }
  }, [filteredWeights])

  const handleDelete = async (id: string) => {
    try {
      await deleteWeight(id)
      setDeleteConfirm(null)
      refetch()
    } catch (error) {
      console.error('Error deleting weight:', error)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-700">משקל</h1>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={18} />}
          onClick={() => {
            setEditRecord(undefined)
            setShowModal(true)
          }}
        >
          הזנה
        </Button>
      </header>

      {/* Time Range Toggle */}
      <div className="flex gap-1 p-1 bg-gray-100/70 rounded-xl overflow-x-auto">
        {[
          { value: '7', label: 'שבוע' },
          { value: '30', label: 'חודש' },
          { value: '90', label: '3 חודשים' },
          { value: '365', label: 'שנה' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTimeRange(value as TimeRange)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              timeRange === value
                ? 'bg-emerald-500 text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <Card>
        {chartData.length > 0 ? (
          <WeightChart data={chartData} />
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">
            אין מספיק נתונים להצגת גרף
          </div>
        )}
      </Card>

      {/* Stats */}
      {stats && (
        <Card>
          <h3 className="font-semibold text-gray-600 mb-4">סיכום תקופה</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">{stats.average}</div>
              <div className="text-xs text-gray-400">ממוצע (ק״ג)</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                stats.change < -0.1 ? 'text-emerald-500' :
                stats.change > 0.1 ? 'text-orange-500' :
                'text-gray-500'
              }`}>
                {stats.change < -0.1 && <TrendingDown size={20} />}
                {stats.change > 0.1 && <TrendingUp size={20} />}
                {Math.abs(stats.change) <= 0.1 && <Minus size={20} />}
                {Math.abs(stats.change)}
              </div>
              <div className="text-xs text-gray-400">שינוי (ק״ג)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">{stats.count}</div>
              <div className="text-xs text-gray-400">מדידות</div>
            </div>
          </div>
        </Card>
      )}

      {/* Records List */}
      <Card>
        <h3 className="font-semibold text-gray-600 mb-4">מדידות אחרונות</h3>
        <div className="space-y-3">
          {filteredWeights.slice(0, 10).map(record => (
            <div
              key={record.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-100/60"
            >
              <div>
                <div className="font-medium text-gray-700">
                  {Number(record.weight)} ק״ג
                </div>
                <div className="text-xs text-gray-400">
                  {formatDate(record.recorded_at, 'EEEE, d/M בשעה HH:mm')}
                </div>
                {record.note && (
                  <div className="text-xs text-gray-500 mt-1">{record.note}</div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditRecord(record)
                    setShowModal(true)
                  }}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200/60"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(record.id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-100/60"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          
          {filteredWeights.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              אין מדידות בתקופה הנבחרת
            </div>
          )}
        </div>
      </Card>

      {/* Entry Modal */}
      <WeightEntryModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditRecord(undefined)
        }}
        existingRecord={editRecord}
        onSuccess={() => {
          setShowModal(false)
          setEditRecord(undefined)
          refetch()
        }}
      />

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="מחיקת מדידה"
        size="sm"
      >
        <p className="text-gray-600 mb-5">האם אתה בטוח שברצונך למחוק מדידה זו?</p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setDeleteConfirm(null)}
            className="flex-1"
          >
            ביטול
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            className="flex-1"
          >
            מחק
          </Button>
        </div>
      </Modal>
    </div>
  )
}
