"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import DiaryDetailDialog from "@/components/diary-detail-dialog";
import { CommunityDetailDialog } from "@/components/community-detail-dialog"
import { MessageCircle, Sparkles, Bookmark, Settings, Heart, MessageSquare, Upload, Trash2 } from "lucide-react"
import Link from "next/link"

const myDiaries = [
  {
    id: 1,
    date: "2025년 1월 15일",
    emotion: "😊",
    title: "좋은 하루였어요",
    preview: "오늘은 친구들과 즐거운 시간을 보냈어요...",
    content: "오늘은 친구들과 즐거운 시간을 보냈어요. 오랜만에 만나서 이야기를 나누니 마음이 따뜻해졌어요.",
    visibility: "private",
    hasImage: false,
    allowComments: false,
  },
]

const myCommunityPosts = [
  {
    id: 1,
    author: "익명의 토끼",
    date: "2시간 전",
    emotion: "😔",
    title: "요즘 너무 힘들어요",
    content: "일도 잘 안 풀리고 사람들과의 관계도 어려워요. 어떻게 해야 할지 모르겠어요.",
    likes: 24,
    comments: 8,
    hasImage: false,
    isMyPost: true,
  },
]

const myBookmarkedPosts = [
  {
    id: 1,
    author: "익명의 새",
    date: "5시간 전",
    emotion: "😊",
    title: "작은 행복을 찾았어요",
    content: "오늘 길을 걷다가 예쁜 꽃을 발견했어요. 작은 것에서 행복을 느낄 수 있다는 게 참 좋아요.",
    likes: 42,
    comments: 15,
    hasImage: true,
    isMyPost: false,
  },
]

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [nickname, setNickname] = useState("감성토끼")
  const [bio, setBio] = useState("감정을 기록하며 성장하는 중입니다")
  const [profileImage, setProfileImage] = useState("/placeholder.svg?height=96&width=96")
  const [selectedDiary, setSelectedDiary] = useState<any>(null)
  const [selectedCommunityPost, setSelectedCommunityPost] = useState<any>(null)
  const [diaryDialogOpen, setDiaryDialogOpen] = useState(false)
  const [communityDialogOpen, setCommunityDialogOpen] = useState(false)
  const [selectedCommentPost, setSelectedCommentPost] = useState<any>(null)
  const [commentPostDialogOpen, setCommentPostDialogOpen] = useState(false)
  const [selectedLikedPost, setSelectedLikedPost] = useState<any>(null)
  const [likedPostDialogOpen, setLikedPostDialogOpen] = useState(false)

  const handleSave = () => {
    setIsEditing(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const openDiaryDetail = (diaryEntry: any) => {
    setSelectedDiary(diaryEntry)
    setDiaryDialogOpen(true)
  }

  const openCommunityDetail = (post: any) => {
    setSelectedCommunityPost(post)
    setCommunityDialogOpen(true)
  }

  const openCommentPostDetail = (post: any) => {
    setSelectedCommentPost(post)
    setCommentPostDialogOpen(true)
  }

  const openLikedPostDetail = (post: any) => {
    setSelectedLikedPost(post)
    setLikedPostDialogOpen(true)
  }

  const handleDeleteCalligraphy = (index: number) => {
    console.log("[v0] Delete calligraphy:", index)
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-8 md:py-12 max-w-5xl">
        {/* Profile Header */}
        <Card className="p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileImage || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">감토</AvatarFallback>
              </Avatar>
              {isEditing && (
                <label
                  htmlFor="profile-image"
                  className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90"
                >
                  <Upload className="h-3 w-3" />
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            <div className="flex-1">
              {!isEditing ? (
                <>
                  <h1 className="text-2xl font-bold mb-2">{nickname}</h1>
                  <p className="text-muted-foreground mb-4">{bio}</p>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    프로필 수정
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nickname">닉네임</Label>
                    <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="bio">소개</Label>
                    <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={2} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave}>
                      저장
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                      취소
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
              <Link href="/diary-posts">
                <div className="cursor-pointer hover:opacity-80 transition-opacity">
                  <p className="text-2xl font-bold">42</p>
                  <p className="text-sm text-muted-foreground">다이어리</p>
                </div>
              </Link>
              <Link href="/profile/followers">
                <div className="cursor-pointer hover:opacity-80 transition-opacity">
                  <p className="text-2xl font-bold">128</p>
                  <p className="text-sm text-muted-foreground">팔로워</p>
                </div>
              </Link>
              <Link href="/profile/following">
                <div className="cursor-pointer hover:opacity-80 transition-opacity">
                  <p className="text-2xl font-bold">95</p>
                  <p className="text-sm text-muted-foreground">팔로잉</p>
                </div>
              </Link>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="calligraphy" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calligraphy">
              <Sparkles className="h-4 w-4 mr-2" />
              필사
            </TabsTrigger>
            <TabsTrigger value="community">
              <MessageCircle className="h-4 w-4 mr-2" />
              커뮤니티
            </TabsTrigger>
            <TabsTrigger value="bookmarks">
              <Bookmark className="h-4 w-4 mr-2" />
              북마크
            </TabsTrigger>
            <TabsTrigger value="interactions">
              <Heart className="h-4 w-4 mr-2" />
              활동
            </TabsTrigger>
          </TabsList>

          {/* Calligraphy Tab */}
          <TabsContent value="calligraphy" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">필사한 문장</h2>
              <p className="text-sm text-muted-foreground">총 18개</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "감정을 표현하는 것은 약함이 아니라 용기입니다",
                "오늘의 작은 진전이 내일의 큰 변화를 만듭니다",
                "완벽하지 않아도 괜찮아요. 있는 그대로의 당신이 충분합니다",
                "어둠 속에서도 빛을 찾을 수 있다면, 그것이 진정한 행복입니다",
              ].map((quote, i) => (
                <Card key={i} className="p-6 relative group">
                  <p className="text-base leading-relaxed mb-3">{quote}</p>
                  <p className="text-xs text-muted-foreground">{i + 2}일 전</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={() => handleDeleteCalligraphy(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="community" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">내가 쓴 글</h2>
              <p className="text-sm text-muted-foreground">총 12개</p>
            </div>
            <div className="space-y-4">
              {myCommunityPosts.map((post) => (
                <Card
                  key={post.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => openCommunityDetail(post)}
                >
                  <div className="flex gap-4">
                    <div className="text-3xl">{post.emotion}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {post.author} • {post.date}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-sm text-muted-foreground">공감 {post.likes}</span>
                        <span className="text-sm text-muted-foreground">댓글 {post.comments}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">북마크한 글</h2>
              <p className="text-sm text-muted-foreground">총 8개</p>
            </div>
            <div className="space-y-4">
              {myBookmarkedPosts.map((post) => (
                <Card
                  key={post.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => openCommunityDetail(post)}
                >
                  <div className="flex gap-4">
                    <div className="text-3xl">{post.emotion}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {post.author} • {post.date}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Interactions Tab */}
          <TabsContent value="interactions" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">내가 쓴 댓글</h2>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    comment: "힘내세요! 저도 비슷한 경험이 있었는데 시간이 지나면 나아질 거예요.",
                    postTitle: "요즘 너무 힘들어요",
                    time: "2시간 전",
                    post: {
                      id: 1,
                      author: "익명의 토끼",
                      date: "2시간 전",
                      emotion: "😔",
                      title: "요즘 너무 힘들어요",
                      content: "일도 잘 안 풀리고 사람들과의 관계도 어려워요. 어떻게 해야 할지 모르겠어요.",
                      likes: 24,
                      comments: 8,
                      hasImage: false,
                      isMyPost: false,
                    },
                  },
                  {
                    id: 2,
                    comment: "공감돼요. 저도 그런 날이 있었어요.",
                    postTitle: "불안한 마음을 나눠요",
                    time: "5시간 전",
                    post: {
                      id: 3,
                      author: "익명의 구름",
                      date: "1일 전",
                      emotion: "😰",
                      title: "불안한 마음을 나눠요",
                      content: "미래가 불안하고 걱정이 많아요. 비슷한 고민을 하시는 분들과 이야기 나누고 싶어요.",
                      likes: 31,
                      comments: 15,
                      hasImage: false,
                      isMyPost: false,
                    },
                  },
                ].map((item) => (
                  <Card
                    key={item.id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => openCommentPostDetail(item.post)}
                  >
                    <div className="flex gap-4">
                      <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm mb-2">{item.comment}</p>
                        <p className="text-xs text-muted-foreground">
                          "{item.postTitle}" 글에 작성 • {item.time}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">좋아요 누른 글</h2>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    author: "익명의 새",
                    date: "5시간 전",
                    emotion: "😊",
                    title: "작은 행복을 찾았어요",
                    content: "오늘 길을 걷다가 예쁜 꽃을 발견했어요. 작은 것에서 행복을 느낄 수 있다는 게 참 좋아요.",
                    likes: 42,
                    comments: 15,
                    hasImage: true,
                    isMyPost: false,
                  },
                  {
                    id: 2,
                    author: "익명의 별",
                    date: "1일 전",
                    emotion: "🥰",
                    title: "감사한 하루였어요",
                    content: "가족들과 함께 시간을 보내며 감사함을 느꼈어요.",
                    likes: 56,
                    comments: 9,
                    hasImage: false,
                    isMyPost: false,
                  },
                ].map((post) => (
                  <Card
                    key={post.id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => openLikedPostDetail(post)}
                  >
                    <div className="flex gap-4">
                      <div className="text-3xl">{post.emotion}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{post.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {post.author} • {post.date}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        {selectedDiary && (
          <DiaryDetailDialog open={diaryDialogOpen} onOpenChange={setDiaryDialogOpen} diaryEntry={selectedDiary} />
        )}
        {selectedCommunityPost && (
          <CommunityDetailDialog
            open={communityDialogOpen}
            onOpenChange={setCommunityDialogOpen}
            post={selectedCommunityPost}
          />
        )}
        {selectedCommentPost && (
          <CommunityDetailDialog
            open={commentPostDialogOpen}
            onOpenChange={setCommentPostDialogOpen}
            post={selectedCommentPost}
          />
        )}
        {selectedLikedPost && (
          <CommunityDetailDialog
            open={likedPostDialogOpen}
            onOpenChange={setLikedPostDialogOpen}
            post={selectedLikedPost}
          />
        )}
      </main>
    </div>
  )
}
