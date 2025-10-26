package org.example.povi.domain.diary.post.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.povi.auth.token.jwt.CustomJwtUser;
import org.example.povi.domain.diary.post.dto.request.DiaryPostCreateReq;
import org.example.povi.domain.diary.post.dto.request.DiaryPostUpdateReq;
import org.example.povi.domain.diary.post.dto.response.*;
import org.example.povi.domain.diary.post.service.DiaryPostService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/diary-posts")
@Tag(name = "Diary Posts", description = "일기 게시글 API")
public class DiaryPostController {

    private final DiaryPostService diaryPostService;

    @PostMapping
    @Operation(summary = "다이어리 생성")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "일기 생성 성공", content =
            @Content(schema = @Schema(implementation = DiaryPostCreateRes.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    public ResponseEntity<DiaryPostCreateRes> createDiaryPost(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @RequestBody @Valid DiaryPostCreateReq createReq
    ) {
        DiaryPostCreateRes res = diaryPostService.createDiaryPost(createReq, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PatchMapping("/{postId}")
    @Operation(summary = "다이어리 수정")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "일기 수정 성공", content =
            @Content(schema = @Schema(implementation = DiaryPostUpdateRes.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "일기를 찾을 수 없음")
    })
    public ResponseEntity<DiaryPostUpdateRes> updateDiaryPost(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PathVariable Long postId,
            @RequestBody @Valid DiaryPostUpdateReq updateReq
    ) {
        DiaryPostUpdateRes res = diaryPostService.updateDiaryPost(postId, updateReq, userId);
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/{postId}")
    @Operation(summary = "다이어리 삭제")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "일기 삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "일기를 찾을 수 없음")
    })
    public ResponseEntity<Void> deleteDiaryPost(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PathVariable Long postId
    ) {
        diaryPostService.deleteDiaryPost(postId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{postId}")
    @Operation(summary = "다이어리 상세 조회 (권한 규칙 적용)", description = "본인 다이어리, 친구의 FRIEND/PUBLIC, 타인의 PUBLIC 다이어리를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공", content =
            @Content(schema = @Schema(implementation = DiaryDetailRes.class))),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "조회 권한 없음"),
            @ApiResponse(responseCode = "404", description = "일기를 찾을 수 없음")
    })
    public ResponseEntity<DiaryDetailRes> getMyDiaryPostDetail(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PathVariable Long postId
    ) {
        DiaryDetailRes res = diaryPostService.getDiaryPostDetail(postId, userId);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/mine")
    @Operation(summary = "내 다이어리 목록 + 주간 감정 통계", description = "내 다이어리 목록과 최근 7일간의 감정 통계를 함께 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공", content =
            @Content(schema = @Schema(implementation = MyDiaryListRes.class))),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    public ResponseEntity<MyDiaryListRes> listMyDiaries(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @PageableDefault(size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal CustomJwtUser user
    ) {
        MyDiaryListRes res = diaryPostService.getMyDiaryPostsWithMonthlyFilter(year, month, pageable, user.getId());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/friends")
    @Operation(summary = "친구 다이어리 - 맞팔이면 FRIEND+PUBLIC, 단방향이면 PUBLIC만",
            description = "맞팔 친구(FRIEND, PUBLIC) 및 단방향 팔로우 친구(PUBLIC)의 다이어리를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공", content =
            @Content(array = @ArraySchema(schema = @Schema(implementation = DiaryPostCardRes.class)))),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    public ResponseEntity<Page<DiaryPostCardRes>> listFriendDiaries(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PageableDefault(size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<DiaryPostCardRes> res = diaryPostService.listFriendDiaries(userId, pageable);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/explore")
    @Operation(summary = "모두의 다이어리 - 맞팔: FRIEND+PUBLIC, 그 외: PUBLIC",
            description = "모든 사용자의 PUBLIC 다이어리 및 맞팔 친구의 FRIEND 다이어리를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공", content =
            @Content(array = @ArraySchema(schema = @Schema(implementation = DiaryPostCardRes.class)))),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    public ResponseEntity<Page<DiaryPostCardRes>> explore(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PageableDefault(size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<DiaryPostCardRes> res = diaryPostService.listExploreFeed(userId, pageable);
        return ResponseEntity.ok(res);
    }
}


