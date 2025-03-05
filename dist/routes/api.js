"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiController_1 = require("../controllers/apiController");
const towakeup_1 = require("../controllers/towakeup");
const router = (0, express_1.Router)();
router.post("/receiveMessage", apiController_1.receiveMessage);
router.get("/healthCheck", towakeup_1.healthCheck);
exports.default = router;
