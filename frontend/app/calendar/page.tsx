"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react"
import DiaryDetailDialog from "@/components/diary-detail-dialog";

const emotionData = {
  "2025-01-01": { emoji: "😊", label: "행복해요", missions: 3 },
  "2025-01-03": { emoji: "😌", label: "평온해요", missions: 2 },
  "2025-01-05": { emoji: "😔", label: "우울해요", missions: 1 },
  "2025-01-07": { emoji: "😊", label: "행복해요", missions: 3 },
  "2025-01-10": { emoji: "😂", label: "즐거워요", missions: 2 },
  "2025-01-13": { emoji: "😔", label: "우울해요", missions: 1 },
  "2025-01-14": { emoji: "😌", label: "평온해요", missions: 3 },
  "2025-01-15": { emoji: "😊", label: "행복해요", missions: 2 },
}

const weekDays = ["일", "월", "화", "수", "목", "금", "토"]

const getEmotionScore = (emoji: string): number => {
  const scores: { [key: string]: number } = {
    "😊": 5,
    "😂": 5,
    "😌": 4,
    "😐": 3,
    "😔": 2,
    "😢": 2,
    "😭": 1,
    "😤": 1,
  }
  return scores[emoji] || 3
}

const getMissionStampColor = (count: number): string => {
  if (count === 3) return "bg-green-500"
  if (count === 2) return "bg-yellow-500"
  if (count === 1) return "bg-orange-500"
  return "bg-gray-300"
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const getDateKey = (day: number) => {
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, "0")
    const dayStr = String(day).padStart(2, "0")
    return `${year}-${month}-${dayStr}`
  }

  const selectedEmotion = selectedDate ? emotionData[selectedDate as keyof typeof emotionData] : null

  const calculateEmotionTrend = () => {
    const scores = Object.values(emotionData).map((data) => getEmotionScore(data.emoji))
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
    const percentage = ((avgScore - 1) / 4) * 100 // Scale from 1-5 to 0-100%
    return percentage
  }

  const emotionTrendPercentage = calculateEmotionTrend()

  const selectedDiary = selectedDate
    ? {
        id: 1,
        date: selectedDate.split("-").join("년 ").replace("년 0", "년 ").replace("-", "월 ") + "일",
        emotion: selectedEmotion?.emoji || "😊",
        title: selectedEmotion?.label || "행복해요",
        content: "오늘은 친구들과 즐거운 시간을 보냈어요. 오랜만에 만나서 이야기를 나누니 마음이 따뜻해졌어요.",
        visibility: "private",
        hasImage: false,
        allowComments: false,
      }
    : null

  const getMissionHistory = (dateKey: string) => {
    const emotion = emotionData[dateKey as keyof typeof emotionData]
    if (!emotion) return []

    return [
      { id: 1, title: "10분 산책하기", completed: emotion.missions >= 1 },
      { id: 2, title: "좋아하는 음악 듣기", completed: emotion.missions >= 2 },
      { id: 3, title: "감사 일기 쓰기", completed: emotion.missions >= 3 },
    ]
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-8 md:py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">감정 캘린더</h1>
          <p className="text-muted-foreground">당신의 감정 여정을 한눈에 확인하세요</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                </h2>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={previousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}

                {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
                  <div key={`empty-${idx}`} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1
                  const dateKey = getDateKey(day)
                  const emotion = emotionData[dateKey as keyof typeof emotionData]
                  const isSelected = selectedDate === dateKey

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateKey)}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-all hover:bg-muted ${
                        isSelected ? "ring-2 ring-primary bg-primary/10" : ""
                      }`}
                    >
                      <span className="text-sm">{day}</span>
                      {emotion && (
                        <>
                          <span className="text-2xl">{emotion.emoji}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: emotion.missions }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${getMissionStampColor(emotion.missions)}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </button>
                  )
                })}
              </div>
            </Card>

            {/* Selected Date Detail */}
            {selectedEmotion && (
              <Card className="p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">
                  {selectedDate?.split("-").join("년 ").replace("년 0", "년 ").replace("-", "월 ")}일
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">{selectedEmotion.emoji}</span>
                  <div>
                    <p className="font-medium text-lg">{selectedEmotion.label}</p>
                    <p className="text-sm text-muted-foreground">이날의 감정</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                      오늘은 친구들과 즐거운 시간을 보냈어요. 오랜만에 만나서 이야기를 나누니 마음이 따뜻해졌어요.
                    </p>
                    <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
                      자세히 보기
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">이날의 미션</h4>
                    <div className="space-y-2">
                      {getMissionHistory(selectedDate).map((mission) => (
                        <div key={mission.id} className="flex items-center gap-2">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              mission.completed ? "bg-green-500" : "bg-gray-300"
                            }`}
                          >
                            {mission.completed && <span className="text-white text-xs">✓</span>}
                          </div>
                          <span className={`text-sm ${mission.completed ? "" : "text-muted-foreground"}`}>
                            {mission.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Analytics Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">최근 한 달 감정 추이</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm mb-2">
                  <span>부정</span>
                  <span>긍정</span>
                </div>
                <div className="relative h-8 bg-gradient-to-r from-red-200 via-gray-200 to-green-200 rounded-full">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-background shadow-lg"
                    style={{ left: `${emotionTrendPercentage}%` }}
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground mt-2">
                  평균 감정 점수: {(emotionTrendPercentage / 20 + 1).toFixed(1)}/5
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">이번 달 다이어리 통계</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">총 기록 일수</span>
                  <span className="font-semibold">8일</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">가장 많은 감정</span>
                  <span className="text-2xl">😊</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">연속 기록</span>
                  <span className="font-semibold">3일</span>
                </div>
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-medium mb-3">감정 분포</p>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl">😊</span>
                      <span className="text-xs text-muted-foreground">4회</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl">😌</span>
                      <span className="text-xs text-muted-foreground">2회</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl">😔</span>
                      <span className="text-xs text-muted-foreground">2회</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl">😂</span>
                      <span className="text-xs text-muted-foreground">1회</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">이번 달 미션 통계</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">완료한 미션</span>
                  <span className="font-semibold">18개</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">완벽한 날 (3개)</span>
                  <span className="font-semibold">3일</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">달성률</span>
                  <span className="font-semibold">75%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Diary Detail Dialog */}
        {selectedDiary && <DiaryDetailDialog open={dialogOpen} onOpenChange={setDialogOpen} diary={selectedDiary} />}
      </main>
    </div>
  )
}
