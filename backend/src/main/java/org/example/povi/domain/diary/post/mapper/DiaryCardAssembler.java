package org.example.povi.domain.diary.post.mapper;

import org.example.povi.domain.diary.post.dto.response.DiaryPostCardRes;
import org.example.povi.domain.diary.post.dto.response.MyDiaryCardRes;
import org.example.povi.domain.diary.post.entity.DiaryPost;
import org.example.povi.domain.diary.post.view.PostViewStats;

import java.util.List;
import java.util.Map;
import java.util.Set;

public final class DiaryCardAssembler {

    private static final int PREVIEW_MAX = 100;

    private DiaryCardAssembler() {
    }

    /**
     * 단일 카드 변환 (나의 다이어리용)
     */
    public static MyDiaryCardRes toMyCard(
            DiaryPost post,
            boolean liked,
            long likeCount,
            long commentCount
    ) {
        String preview = DiaryPreviewMapper.buildPreviewText(post.getContent(), PREVIEW_MAX);
        String thumbnail = DiaryPreviewMapper.firstImageUrl(post);

        return new MyDiaryCardRes(
                post.getId(),
                post.getTitle(),
                preview,
                post.getMoodEmoji(),
                thumbnail,
                post.getVisibility(),
                post.getCreatedAt().toLocalDate(),
                liked,
                likeCount,
                commentCount
        );
    }

    /**
     * 여러 게시글을 한 번에 DTO 리스트로 변환 (PostViewStats와 함께)
     */
    public static List<DiaryPostCardRes> toCards(
            List<DiaryPost> posts,
            Set<Long> likedSet,
            Map<Long, Long> likeCnt,
            Map<Long, Long> commentCnt
    ) {
        return posts.stream()
                .map(p -> DiaryPostCardRes.from(
                        p,
                        PostViewStats.of(likedSet, likeCnt, commentCnt, p.getId())
                ))
                .toList();
    }
}