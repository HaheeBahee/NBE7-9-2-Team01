"use client";

import { JSX, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
    Heart,
    MessageCircle,
    Pencil,
    Trash2,
    Maximize2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import api from "@/lib/axios";

/* ================== Types ================== */
interface DiaryDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    diary: {
        id: number;
        author?: string;
        date: string; // ISO yyyy-mm-dd (부모에서 생성)
        emotion: string; // 이미 이모지(😊 등)
        title: string;
        content: string;
        visibility?: "private" | "friends" | "public";
        hasImage?: boolean;
        likes?: number;
        allowComments?: boolean;
        imageUrls?: string[];
        isMine?: boolean;
    };
    onLikeToggle?: (postId: number, liked: boolean, likeCount: number) => void;
    onCommentChange?: (postId: number, commentCount: number) => void;
    onPostUpdated?: (postId: number) => void;
    /** 삭제 후 부모 목록/통계 반영용. createdDate는 이번주 여부 계산에 사용 */
    onPostDeleted?: (postId: number, createdDate?: string) => void;
}

interface Comment {
    id: number;
    authorName: string;
    content: string;
    createdAt: string;
    isMine: boolean;
}

type LikeRes = { liked: boolean; likeCount: number };

/* ================ Component ================= */
export default function DiaryDetailDialog({
                                              open,
                                              onOpenChange,
                                              diary,
                                              onLikeToggle,
                                              onCommentChange,
                                              onPostDeleted,
                                          }: DiaryDetailDialogProps): JSX.Element {
    const router = useRouter();

    /* 댓글/좋아요 상태 */
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState<Comment[]>([]);
    const prevCountRef = useRef<number>(0);

    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [likeLoading, setLikeLoading] = useState(false);

    /* 이미지 확대 */
    const [zoomIdx, setZoomIdx] = useState<number | null>(null);
    const images = Array.isArray(diary.imageUrls) ? diary.imageUrls : [];

    /* 초기 로드: 댓글/좋아요 */
    useEffect(() => {
        if (!open || !diary?.id) return;

        const fetchComments = async () => {
            try {
                const res = await api.get(`/diary-posts/${diary.id}/comments`, {
                    params: { size: 30, sort: "id,asc" },
                });
                const list = Array.isArray(res.data?.content) ? res.data.content : [];
                setComments(
                    list.map((c: any) => ({
                        id: c.commentId,
                        authorName: c.authorName,
                        content: c.content,
                        createdAt: new Date(c.createdAt).toLocaleString(),
                        isMine: !!c.isMine,
                    }))
                );
            } catch (err) {
                console.error("❌ 댓글 조회 실패:", err);
                setComments([]);
            }
        };

        const fetchLikes = async () => {
            try {
                const { data } = await api.get(`/diary-posts/${diary.id}/likes/me`);
                setIsLiked(Boolean(data.liked));
                setLikeCount(Number(data.likeCount ?? 0));
            } catch (err) {
                console.error("❌ 좋아요 상태 조회 실패:", err);
                setIsLiked(false);
                setLikeCount(0);
            }
        };

        fetchComments();
        fetchLikes();
    }, [open, diary?.id]);

    /* 댓글 수 변화 통지 */
    useEffect(() => {
        if (!open) return;
        if (comments.length !== prevCountRef.current) {
            onCommentChange?.(diary.id, comments.length);
            prevCountRef.current = comments.length;
        }
    }, [open, comments.length, diary.id, onCommentChange]);

    /* 좋아요 토글 */
    const handleToggleLike = async () => {
        if (!diary?.id || likeLoading) return;
        setLikeLoading(true);
        try {
            const { data } = await api.post<LikeRes>(`/diary-posts/${diary.id}/likes/toggle`);
            setIsLiked(Boolean(data.liked));
            setLikeCount(Number(data.likeCount ?? 0));
            onLikeToggle?.(diary.id, Boolean(data.liked), Number(data.likeCount ?? 0));
        } catch (err) {
            console.error("❌ 좋아요 토글 실패:", err);
        } finally {
            setLikeLoading(false);
        }
    };

    /* 댓글 작성/수정/삭제 */
    const handleCreateComment = async () => {
        if (!comment.trim()) return;
        try {
            const res = await api.post(`/diary-posts/${diary.id}/comments`, { content: comment.trim() });
            setComments((prev) => [
                ...prev,
                {
                    id: res.data.commentId,
                    authorName: res.data.authorName,
                    content: res.data.content,
                    createdAt: new Date(res.data.createdAt).toLocaleString(),
                    isMine: true,
                },
            ]);
            setComment("");
        } catch (err) {
            console.error("❌ 댓글 작성 실패:", err);
        }
    };

    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editCommentText, setEditCommentText] = useState("");

    const handleSaveComment = async (commentId: number) => {
        try {
            await api.patch(`/diary-posts/${diary.id}/comments/${commentId}`, {
                content: editCommentText.trim(),
            });
        } catch (err) {
            console.error("❌ 댓글 수정 실패:", err);
            return;
        }
        setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, content: editCommentText } : c)));
        setEditingCommentId(null);
        setEditCommentText("");
    };

    const handleDeleteComment = async (commentId: number) => {
        try {
            await api.delete(`/diary-posts/${diary.id}/comments/${commentId}`);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
        } catch (e) {
            console.error("❌ 댓글 삭제 실패:", e);
        }
    };

    /* 게시글 삭제 */
    const handleDeletePost = async () => {
        if (!confirm("정말 삭제할까요? 되돌릴 수 없습니다.")) return;
        try {
            await api.delete(`/diary-posts/${diary.id}`);
            onOpenChange(false);
            onPostDeleted?.(diary.id, diary.date); // ✅ 작성일 함께 전달
        } catch (e) {
            console.error("❌ 게시글 삭제 실패:", e);
            alert("삭제에 실패했습니다.");
        }
    };

    /* 수정 페이지로 이동(+초기값 seed 전달) */
    const goEditPage = () => {
        const seed = {
            id: diary.id,
            title: diary.title,
            content: diary.content,
            visibility: diary.visibility, // "private" | "friends" | "public"
            imageUrls: images,
            // moodEmoji는 상세 응답에 없으면 생략(수정 페이지에서 GET으로 보정 가능)
        };
        try {
            sessionStorage.setItem("povi.edit.seed", JSON.stringify(seed));
        } catch {
            // storage가 막혀있더라도 그냥 진행
        }
        onOpenChange(false);
        router.push(`/diary-posts/${diary.id}/edit`);
    };

    /* 이미지 이동 */
    const prevImg = () =>
        setZoomIdx((i) => (i === null ? null : (i + images.length - 1) % images.length));
    const nextImg = () => setZoomIdx((i) => (i === null ? null : (i + 1) % images.length));

    /* ================ Render ================ */
    return (
        <>
            {/* 상세 모달 */}
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle className="sr-only">다이어리 상세보기</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-start gap-4">
                            <div className="text-5xl">{diary.emotion}</div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-2">{diary.title}</h2>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            {diary.author && (
                                                <>
                                                    <span>{diary.author}</span>
                                                    <span>•</span>
                                                </>
                                            )}
                                            <span>{diary.date}</span>
                                            {diary.visibility && (
                                                <>
                                                    <span>•</span>
                                                    <span className="px-2 py-0.5 bg-muted rounded-full text-xs">
                            {diary.visibility === "private"
                                ? "비공개"
                                : diary.visibility === "friends"
                                    ? "친구공개"
                                    : "전체공개"}
                          </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 본문 */}
                        <div className="prose prose-sm max-w-none">
                            <p className="text-base leading-relaxed whitespace-pre-wrap">{diary.content}</p>
                        </div>

                        {/* 이미지 썸네일 */}
                        {images.length > 0 && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {images.map((src, idx) => (
                                        <button
                                            key={src + idx}
                                            type="button"
                                            className="relative group aspect-[4/3] overflow-hidden rounded-xl bg-muted"
                                            onClick={() => setZoomIdx(idx)}
                                        >
                                            <img
                                                src={src}
                                                alt={`이미지 ${idx + 1}`}
                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                loading="lazy"
                                            />
                                            <span className="absolute right-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5 text-xs text-white">
                        {idx + 1}/{images.length}
                      </span>
                                            <span className="absolute bottom-2 right-2 rounded-md bg-white/80 p-1">
                        <Maximize2 className="h-4 w-4" />
                      </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-4 border-t">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                                onClick={handleToggleLike}
                                disabled={likeLoading}
                            >
                                <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                                {likeCount}
                            </Button>

                            <Button variant="ghost" size="sm" className="gap-2">
                                <MessageCircle className="h-4 w-4" />
                                {comments.length}
                            </Button>

                            {/* 수정/삭제: 내 글만 */}
                            {diary.isMine && (
                                <div className="ml-auto flex gap-2">
                                    <Button variant="outline" size="sm" onClick={goEditPage}>
                                        수정
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={handleDeletePost}>
                                        삭제
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* 댓글 섹션 */}
                        {diary.allowComments !== false && (
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-semibold">댓글 {comments.length}</h3>

                                {/* 입력 */}
                                <div className="flex gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="/placeholder.svg" />
                                        <AvatarFallback>나</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-2">
                                        <Textarea
                                            placeholder="댓글을 입력하세요..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            rows={2}
                                        />
                                        <Button size="sm" onClick={handleCreateComment} disabled={!comment.trim()}>
                                            댓글 작성
                                        </Button>
                                    </div>
                                </div>

                                {/* 목록 */}
                                <div className="space-y-4">
                                    {comments.map((c) => (
                                        <Card key={c.id} className="p-4">
                                            <div className="flex gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src="/placeholder.svg" />
                                                    <AvatarFallback>{c.authorName?.[0] ?? "?"}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-sm">{c.authorName}</span>
                                                            <span className="text-xs text-muted-foreground">{c.createdAt}</span>
                                                        </div>
                                                        {c.isMine && (
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-6 w-6 p-0"
                                                                    onClick={() => {
                                                                        setEditingCommentId(c.id);
                                                                        setEditCommentText(c.content);
                                                                    }}
                                                                >
                                                                    <Pencil className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                                                    onClick={() => handleDeleteComment(c.id)}
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {editingCommentId === c.id ? (
                                                        <div className="space-y-2">
                                                            <Textarea
                                                                value={editCommentText}
                                                                onChange={(e) => setEditCommentText(e.target.value)}
                                                                rows={2}
                                                            />
                                                            <div className="flex gap-2">
                                                                <Button size="sm" onClick={() => handleSaveComment(c.id)}>
                                                                    저장
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => setEditingCommentId(null)}
                                                                >
                                                                    취소
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm leading-relaxed">{c.content}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* 이미지 확대 모달 */}
            <Dialog
                open={zoomIdx !== null}
                onOpenChange={(o) => {
                    if (!o) setZoomIdx(null);
                }}
            >
                <DialogContent className="max-w-6xl p-0" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle className="sr-only">이미지 확대</DialogTitle>
                    </DialogHeader>

                    {zoomIdx !== null ? (
                        <div className="relative h-[80vh] w-full bg-black">
                            <img
                                src={images[zoomIdx] ?? ""}
                                alt={`확대 이미지 ${zoomIdx + 1}`}
                                className="mx-auto h-full object-contain"
                            />

                            {images.length > 1 ? (
                                <>
                                    <button
                                        onClick={prevImg}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2"
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </button>
                                    <button
                                        onClick={nextImg}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2"
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </button>
                                </>
                            ) : null}

                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/80 px-3 py-1 text-sm">
                                {zoomIdx + 1} / {images.length}
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </>
    );
}
