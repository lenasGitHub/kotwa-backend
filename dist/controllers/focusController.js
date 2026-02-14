"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endFocusSession = exports.resumeFocusSession = exports.pauseFocusSession = exports.startFocusSession = void 0;
const focus_service_1 = require("../services/focus.service");
const startFocusSession = async (req, res, next) => {
    try {
        const { habitId, challengeId } = req.body;
        const session = await focus_service_1.FocusService.startSession(req.userId, habitId, challengeId);
        res.status(201).json({ success: true, data: session });
    }
    catch (error) {
        next(error);
    }
};
exports.startFocusSession = startFocusSession;
const pauseFocusSession = async (req, res, next) => {
    try {
        const { id } = req.params;
        const session = await focus_service_1.FocusService.pauseSession(req.userId, id);
        res.json({ success: true, data: session });
    }
    catch (error) {
        next(error);
    }
};
exports.pauseFocusSession = pauseFocusSession;
const resumeFocusSession = async (req, res, next) => {
    try {
        const { id } = req.params;
        const session = await focus_service_1.FocusService.resumeSession(req.userId, id);
        res.json({ success: true, data: session });
    }
    catch (error) {
        next(error);
    }
};
exports.resumeFocusSession = resumeFocusSession;
const endFocusSession = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { duration } = req.body; // actual duration in seconds
        const session = await focus_service_1.FocusService.endSession(req.userId, id, duration);
        res.json({ success: true, data: session });
    }
    catch (error) {
        next(error);
    }
};
exports.endFocusSession = endFocusSession;
//# sourceMappingURL=focusController.js.map