const express = require('express');
const { Post, User, Comment, Post_Image } = require('../models');
const router = express.Router();
const { isLoggedIn } = require('../utils/middlewares');
const ApiResponse = require("../utils/ApiResponse");

router.get('/:PostId', isLoggedIn, async (req, res) => {
   try {
        const post = await Post.findOne({
            where: {
                id: req.params.PostId
            },
            include: [{
                model: User,
                attributes: ['id', 'nickname'],
            }, {
                model: Comment,
                include: [{
                    model: User,
                    attributes: ['id', 'nickname'],
                }]
            }, {
                model: Post_Image
            }],
        });
        if (!post) {
            return res.status(404).json(ApiResponse.error('존재하지 않는 게시글 입니다.'));
        }
       return res.status(200).json(ApiResponse.success('게시글 조회 성공', { post }));
   } catch (e) {
       console.error(e);
       res.status(500).json(ApiResponse.error(e));
   }
});

router.post('/', isLoggedIn, async (req, res) => {
   try {
        const post = await Post.create({
            title: req.body.title,
            content: req.body.content,
            UserId: req.user.id
        });

       const fullPost = await Post.findOne({
           where: { id: post.id },
           include: [{
               model: Post_Image
           }, {
               model: Comment,
               include: [{
                   model: User,
                   attributes: ['id', 'nickname']
               }]
           }, {
               model: User,
               attributes: ['id', 'nickname']
           }, {
               model: User,
               as: 'Likers',
               attributes: ['id', 'nickname']
           }]
       });

        res.status(200).json(ApiResponse.success("게시글 등록 성공", fullPost));
   } catch (e) {
        console.error(e);
        res.status(500).json(ApiResponse.error('서버 오류가 발생했습니다.'));
   }
});

router.patch('/:PostId/like', isLoggedIn, async (req, res) => {
    try {
        const post = await Post.findOne({
            where: {
                id: req.params.PostId
            }
        });
        if (!post) {
            return res.status(404).json(ApiResponse.error('존재하지 않는 게시글 입니다.'));
        }
        await post.addLikers(req.user.id);
        res.status(200).json(ApiResponse.success('좋아요 등록 성공', { PostId: post.id, UserId: req.user.id }));
    } catch (e) {
        console.error(e);
        res.status(500).json(ApiResponse.error('서버 오류가 발생했습니다.'));
    }
});

router.get('/:PostId/like', isLoggedIn, async (req, res) => {
    try {
        const postIdWithLike = await Post.findOne({
            where: {
                id: req.params.PostId
            },
            attributes: ['id'],
            include: [{
                model: User,
                as: 'Likers',
                attributes: ['id', 'nickname'],
            }]
        });
        if (!postIdWithLike) {
            return res.status(404).json(ApiResponse.error('존재하지 않는 게시글 입니다.'));
        }
        res.status(200).json(ApiResponse.success(`${ postIdWithLike.id } 게시글 좋아요 조회 성공`, postIdWithLike ));
    } catch (e) {
        console.error(e);
        res.status(500).json(ApiResponse.error('서버 오류가 발생했습니다.'));
    }
});

router.delete('/:PostId/like', isLoggedIn, async (req, res) => {
   try {
       const findPost = await Post.findOne({
           where: {
               id: req.params.PostId
           },
           attributes: ['id'],
       });
       if (!findPost) {
           return res.status(404).json(ApiResponse.error('존재하지 않는 게시글 입니다.'));
       }
       findPost.removeLikers(req.user.id);
       res.status(200).json(ApiResponse.success(`PostId: ${findPost.id}, UserId: ${req.user.id} 삭제 성공`, { PostId: findPost.id, UserId: req.user.id }));
   } catch (e) {
       console.error(e);
       res.status(500).json(ApiResponse.error('서버 오류가 발생했습니다.'));
   }
});

router.post('/:PostId/comment', isLoggedIn, async (req, res) => {
    try {
        const post = await Post.findOne({
            where: { id: req.params.PostId },
        });
        if (!post) {
            return res.status(404).json(ApiResponse.error('존재하지 않는 게시글 입니다.'));
        }
        const comment = await Comment.create({
            content: req.body.content,
            UserId: req.user.id,
            PostId: parseInt(req.params.PostId, 10)
        });

        const fullComment = await Comment.findOne({
            where: { id: comment.id },
            include: [{
                model: User,
                attributes: ['id', 'nickname'],
            }]
        })
        res.status(201).json(ApiResponse.success("댓글 등록 완료", fullComment));
    } catch (e) {
        console.error(e);
        res.status(500).json(ApiResponse.error(e.message));
    }
});

module.exports = router;