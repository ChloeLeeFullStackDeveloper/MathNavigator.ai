"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
let AIController = class AIController {
    constructor(aiService) {
        this.aiService = aiService;
    }
    async explain(body) {
        const { question, userAnswer, correctAnswer } = body;
        const prompt = `
You are a helpful math tutor. A student answered a multiple-choice question incorrectly.

Question: ${question}
Their answer: "${userAnswer}"
Correct answer: "${correctAnswer}"

Please explain why the student's answer is incorrect, and why the correct answer is right, in simple terms.
`;
        const explanation = await this.aiService.generateChatCompletion(prompt);
        return { explanation };
    }
};
exports.AIController = AIController;
__decorate([
    (0, common_1.Post)('explain'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "explain", null);
exports.AIController = AIController = __decorate([
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [ai_service_1.AIService])
], AIController);
//# sourceMappingURL=ai.controller.js.map