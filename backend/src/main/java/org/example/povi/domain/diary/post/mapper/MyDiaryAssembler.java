package org.example.povi.domain.diary.post.mapper;

import org.example.povi.domain.diary.enums.MoodEmoji;
import org.example.povi.domain.diary.post.dto.response.MoodSummaryRes;
import org.example.povi.domain.diary.post.dto.response.MyDiaryCardRes;
import org.example.povi.domain.diary.post.dto.response.MyDiaryListRes;
import org.example.povi.domain.diary.post.entity.DiaryPost;
import org.example.povi.domain.diary.post.view.PostViewStats;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 내 다이어리 목록 조립기
 * - 카드 리스트: 월별 조회 결과(Page)
 * - 통계 데이터: 이번 주 리스트 기반
 */
public final class MyDiaryAssembler {
    private MyDiaryAssembler() {}

    /** 월별 카드(Page) + 이번주 통계 전용 리스트(thisWeekPosts) 분리 입력 */
    public static MyDiaryListRes build(
            Page<DiaryPost> cardPage,
            List<DiaryPost> thisWeekPosts,
            Set<Long> likedSetForCards,
            Map<Long, Long> likeCntForCards,
            Map<Long, Long> cmtCntForCards
    ) {
        // 1) 카드: 월별 필터 결과만 사용
        List<MyDiaryCardRes> cards = cardPage.getContent().stream()
                .map(p -> MyDiaryCardRes.from(
                        p,
                        PostViewStats.of(likedSetForCards, likeCntForCards, cmtCntForCards, p.getId())
                ))
                .toList();

        // 2) 통계: 이번 주 리스트에서만 계산
        long weeklyCount = thisWeekPosts.size();
        double avgValence = thisWeekPosts.stream()
                .mapToInt(p -> p.getMoodEmoji().valence())
                .average().orElse(0.0);

        return new MyDiaryListRes(
                cardPage.getTotalElements(),
                weeklyCount,
                new MoodSummaryRes(avgValence, MoodEmoji.fromValence(avgValence)),
                cards
        );
    }
}