const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');
const { fetchWithTimeout } = require('../../util/fetch-with-timeout');

/**
 * LLM扩展的图标，编码为data URI
 * @type {string}
 */
const menuIconURI = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNEgxNkMxNi41NTIzIDQgMTcgNC40NDc3MiAxNyA1VjE1QzE3IDE1LjU1MjMgMTYuNTUyMyAxNiAxNiAxNkg0QzMuNDQ3NzIgMTYgMyAxNS41NTIzIDMgMTVWNUMzIDQuNDQ3NzIgMy40NDc3MiA0IDQgNFoiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTYgOEgxNCIgc3Ryb2tlPSIjMzMzMzMzIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik02IDEwLjVIMTIiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNNiAxM0gxMCIgc3Ryb2tlPSIjMzMzMzMzIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=';

/**
 * 每个积木左侧显示的图标
 * @type {string}
 */
const blockIconURI = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggOEgzMkMzMy4xMDQ2IDggMzQgOC44OTU0MyAzNCA5VjMxQzM0IDMyLjEwNDYgMzMuMTA0NiAzMyAzMiAzM0g4QzYuODk1NDMgMzMgNiAzMi4xMDQ2IDYgMzFWOUM2IDguODk1NDMgNi44OTU0MyA4IDggOFoiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CjxwYXRoIGQ9Ik0xMiAxNkgyOCIgc3Ryb2tlPSIjMzMzMzMzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTIgMjFIMjQiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHA1dGggZD0iTTEyIDI2SDIwIiBzdHJva2U9IiMzMzMzMzMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=';

/**
 * 默认API超时时间（毫秒）
 * @type {number}
 */
const DEFAULT_TIMEOUT = 30000; // 30秒

/**
 * Scratch3LLMBlocks类，实现LLM大语言模型扩展
 * @constructor
 */
class Scratch3LLMBlocks {
    constructor(runtime) {
        /**
         * runtime实例
         * @type {Runtime}
         */
        this.runtime = runtime;

        /**
         * 存储每个target的LLM配置
         * @type {Map}
         */
        this._targetConfigs = new Map();
    }

    /**
     * 获取扩展信息
     * @returns {object} 扩展的元数据
     */
    getInfo() {
        return {
            id: 'llm',
            name: 'LLM大语言模型',
            blockIconURI: blockIconURI,
            menuIconURI: menuIconURI,
            color1: '#9966FF',
            color2: '#774DCB',
            color3: '#5d3b9e',
            blocks: [
                {
                    opcode: 'callLLM',
                    text: '调用LLM [URL] API密钥 [API_KEY] 模型 [MODEL] 系统提示 [SYSTEM_PROMPT] 用户提示 [USER_PROMPT]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
                        },
                        API_KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: ''
                        },
                        MODEL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'qwen-vl-max'
                        },
                        SYSTEM_PROMPT: {
                            type: ArgumentType.STRING,
                            defaultValue: '你是一个有用的助手'
                        },
                        USER_PROMPT: {
                            type: ArgumentType.STRING,
                            defaultValue: '你好'
                        }
                    }
                },
                {
                    opcode: 'callLLMWithImage',
                    text: '调用带图像的LLM [URL] API密钥 [API_KEY] 模型 [MODEL] 系统提示 [SYSTEM_PROMPT] 用户提示 [USER_PROMPT] 图像URL [IMAGE_URL]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
                        },
                        API_KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: ''
                        },
                        MODEL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'qwen-vl-max'
                        },
                        SYSTEM_PROMPT: {
                            type: ArgumentType.STRING,
                            defaultValue: '你是一个有用的助手'
                        },
                        USER_PROMPT: {
                            type: ArgumentType.STRING,
                            defaultValue: '请描述这张图片'
                        },
                        IMAGE_URL: {
                            type: ArgumentType.STRING,
                            defaultValue: ''
                        }
                    }
                },
                {
                    opcode: 'callLLMAdvanced',
                    text: '高级LLM调用 [URL] API密钥 [API_KEY] 模型 [MODEL] 系统提示 [SYSTEM_PROMPT] 用户提示 [USER_PROMPT] 图像URL [IMAGE_URL] 温度 [TEMPERATURE]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
                        },
                        API_KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: ''
                        },
                        MODEL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'qwen-vl-max'
                        },
                        SYSTEM_PROMPT: {
                            type: ArgumentType.STRING,
                            defaultValue: '你是一个有用的助手'
                        },
                        USER_PROMPT: {
                            type: ArgumentType.STRING,
                            defaultValue: '你好'
                        },
                        IMAGE_URL: {
                            type: ArgumentType.STRING,
                            defaultValue: ''
                        },
                        TEMPERATURE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.7
                        }
                    }
                }
            ]
        };
    }

    /**
     * 构建OpenAI兼容的消息格式
     * @param {string} systemPrompt 系统提示
     * @param {string} userPrompt 用户提示
     * @param {string} imageUrl 图像URL（可选）
     * @returns {Array} 消息数组
     */
    _buildMessages(systemPrompt, userPrompt, imageUrl = '') {
        const messages = [];

        // 添加系统消息
        if (systemPrompt && systemPrompt.trim()) {
            messages.push({
                role: 'system',
                content: Cast.toString(systemPrompt)
            });
        }

        // 构建用户消息
        const userMessage = {
            role: 'user',
            content: []
        };

        // 添加文本内容
        if (userPrompt && userPrompt.trim()) {
            userMessage.content.push({
                type: 'text',
                text: Cast.toString(userPrompt)
            });
        }

        // 添加图像内容（如果提供）
        if (imageUrl && imageUrl.trim()) {
            userMessage.content.push({
                type: 'image_url',
                image_url: {
                    url: Cast.toString(imageUrl)
                }
            });
        }

        // 如果只有文本内容，简化格式
        if (userMessage.content.length === 1 && userMessage.content[0].type === 'text') {
            userMessage.content = userMessage.content[0].text;
        }

        messages.push(userMessage);

        return messages;
    }

    /**
     * 调用LLM API
     * @param {object} args 积木参数
     * @param {object} util 工具对象
     * @returns {Promise<string>} LLM响应内容
     */
    async callLLM(args, util) {
        const url = Cast.toString(args.URL);
        const apiKey = Cast.toString(args.API_KEY);
        const model = Cast.toString(args.MODEL);
        const systemPrompt = Cast.toString(args.SYSTEM_PROMPT);
        const userPrompt = Cast.toString(args.USER_PROMPT);

        return this._makeLLMRequest(url, apiKey, model, systemPrompt, userPrompt);
    }

    /**
     * 调用带图像的LLM API
     * @param {object} args 积木参数
     * @param {object} util 工具对象
     * @returns {Promise<string>} LLM响应内容
     */
    async callLLMWithImage(args, util) {
        const url = Cast.toString(args.URL);
        const apiKey = Cast.toString(args.API_KEY);
        const model = Cast.toString(args.MODEL);
        const systemPrompt = Cast.toString(args.SYSTEM_PROMPT);
        const userPrompt = Cast.toString(args.USER_PROMPT);
        const imageUrl = Cast.toString(args.IMAGE_URL);

        return this._makeLLMRequest(url, apiKey, model, systemPrompt, userPrompt, imageUrl);
    }

    /**
     * 高级LLM调用
     * @param {object} args 积木参数
     * @param {object} util 工具对象
     * @returns {Promise<string>} LLM响应内容
     */
    async callLLMAdvanced(args, util) {
        const url = Cast.toString(args.URL);
        const apiKey = Cast.toString(args.API_KEY);
        const model = Cast.toString(args.MODEL);
        const systemPrompt = Cast.toString(args.SYSTEM_PROMPT);
        const userPrompt = Cast.toString(args.USER_PROMPT);
        const imageUrl = Cast.toString(args.IMAGE_URL);
        const temperature = Cast.toNumber(args.TEMPERATURE);

        return this._makeLLMRequest(url, apiKey, model, systemPrompt, userPrompt, imageUrl, temperature);
    }

    /**
     * 执行LLM API请求
     * @param {string} url API端点URL
     * @param {string} apiKey API密钥
     * @param {string} model 模型名称
     * @param {string} systemPrompt 系统提示
     * @param {string} userPrompt 用户提示
     * @param {string} imageUrl 图像URL（可选）
     * @param {number} temperature 温度参数（可选）
     * @returns {Promise<string>} LLM响应内容
     */
    async _makeLLMRequest(url, apiKey, model, systemPrompt, userPrompt, imageUrl = '', temperature = 0.7) {
        try {
            // 验证必填参数
            if (!url || !apiKey || !model || !userPrompt) {
                throw new Error('URL、API密钥、模型和用户提示是必填参数');
            }

            // 构建请求体
            const requestBody = {
                model: model,
                messages: this._buildMessages(systemPrompt, userPrompt, imageUrl)
            };

            // 添加temperature参数（如果提供且不是默认值）
            if (temperature !== 0.7) {
                requestBody.temperature = Math.max(0, Math.min(2, temperature)); // 限制在0-2之间
            }

            // 设置请求头
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            };

            log.info(`LLM扩展: 正在请求 ${url}`);
            log.info(`LLM扩展: 请求体`, JSON.stringify(requestBody, null, 2));

            // 发送请求
            const response = await fetchWithTimeout(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            }, DEFAULT_TIMEOUT);

            // 检查响应状态
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            // 解析响应
            const data = await response.json();
            log.info(`LLM扩展: 响应数据`, JSON.stringify(data, null, 2));

            // 提取内容
            if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                return data.choices[0].message.content || '';
            } else {
                throw new Error('响应格式错误：未找到有效的消息内容');
            }

        } catch (error) {
            log.error(`LLM扩展错误: ${error.message}`);
            return `错误: ${error.message}`;
        }
    }
}

module.exports = Scratch3LLMBlocks;

