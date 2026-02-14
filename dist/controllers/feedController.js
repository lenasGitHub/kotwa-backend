"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactToProof = exports.getMainFeed = void 0;
const feed_service_1 = require("../services/feed.service");
const getMainFeed = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await feed_service_1.FeedService.getMainFeed(req.userId, page, limit);
        res.json({ success: true, ...result });
    }
    catch (error) {
        next(error);
    }
};
exports.getMainFeed = getMainFeed;
const reactToProof = async (req, res, next) => {
    try {
        const { id } = req.params; // proofId
        const { type } = req.body; // reaction type
        const result = await feed_service_1.FeedService.reactToProof(req.userId, id, type);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.reactToProof = reactToProof;
//# sourceMappingURL=feedController.js.map