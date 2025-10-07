const _Runtime = require('../../engine/runtime');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const formatMessage = require('format-message');
const Buffer = require('buffer').Buffer;

/**
 * Icon svg to be displayed in the blocks category menu, encoded as a data URI.
 * @type {string}
 */
const menuIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4K' +
  'PHN2ZyB3aWR0aD0iMjBweCIgaGVpZ2h0PSIyMHB4IiB2aWV3Qm94PSIwIDAgMjAgMjAiIHZlcnNpb249IjEuMSIgeG1sbnM9' +
  'Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+' +
  'CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjIgKDY3MTQ1KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29t' +
  'L3NrZXRjaCAtLT4KICAgIDx0aXRsZT5FeHRlbnNpb25zL0Nsb3VkL0FsaXl1bi1PU1MtTWVudTwvdGl0bGU+CiAgICA8ZGVz' +
  'Yz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxnIGlkPSJFeHRlbnNpb25zL0Nsb3VkL0FsaXl1bi1PU1MtTWVu' +
  'dSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAg' +
  'ICAgICAgIDxnIGlkPSJjbG91ZC11cGxvYWQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMDAwMDAwLCA1LjAwMDAwMCkiIGZp' +
  'bGwtcnVsZT0ibm9uemVybyI+CiAgICAgICAgICAgICAgICA8Y2lyY2xlIGlkPSJDaXJjbGUiIGZpbGw9IiMwMDdDRkYiIG9w' +
  'YWNpdHk9IjAuMyIgY3g9IjEwIiBjeT0iMTAiIHI9IjgiPjwvY2lyY2xlPgogICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0i' +
  'Q2lyY2xlLUNvcHkiIGZpbGw9IiMwMDdDRkYiIG9wYWNpdHk9IjAuNSIgY3g9IjEwIiBjeT0iMTAiIHI9IjYiPjwvY2lyY2xl' +
  'PgogICAgICAgICAgICAgICAgPHBhdGggaWQ9IlVwbG9hZC1BcnJvdyIgZD0iTTEwLDYgTDEwLDE0IE02LDEwIEwxMCw2IEwx' +
  'NCwxMCIgc3Ryb2tlPSIjMDA3Q0ZGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxp' +
  'bmVqb2luPSJyb3VuZCIgZmlsbD0ibm9uZSIvPgogICAgICAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=';

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4K' +
  'PHN2ZyB3aWR0aD0iNDBweCIgaGVpZ2h0PSI0MHB4IiB2aWV3Qm94PSIwIDAgNDAgNDAiIHZlcnNpb249IjEuMSIgeG1sbnM9' +
  'Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+' +
  'CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjIgKDY3MTQ1KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29t' +
  'L3NrZXRjaCAtLT4KICAgIDx0aXRsZT5FeHRlbnNpb25zL0Nsb3VkL0FsaXl1bi1PU1MtQmxvY2s8L3RpdGxlPgogICAgPGRl' +
  'c2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZyBpZD0iRXh0ZW5zaW9ucy9DbG91ZC9BbGl5dW4tT1NTLUJs' +
  'b2NrIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJv' +
  'a2Utb3BhY2l0eT0iMC4xNSI+CiAgICAgICAgICAgIDxnIGlkPSJjbG91ZC11cGxvYWQiIHRyYW5zZm9ybT0idHJhbnNsYXRl' +
  'KDAuMDAwMDAwLCAxMC4wMDAwMDApIiBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0iIzAwMDAwMCI+CiAgICAgICAgICAgICAg' +
  'ICAgPGNpcmNsZSBpZD0iQ2lyY2xlIiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjMiIHN0cm9rZS1saW5lY2FwPSJyb3Vu' +
  'ZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY3g9IjIwIiBjeT0iMjAiIHI9IjE2Ij48L2NpcmNsZT4KICAgICAgICAgICAg' +
  'ICAgICA8Y2lyY2xlIGlkPSJDaXJjbGUtQ29weSIgZmlsbD0iI0ZGRkZGRiIgb3BhY2l0eT0iMC41IiBzdHJva2UtbGluZWNh' +
  'cD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGN4PSIyMCIgY3k9IjIwIiByPSIxMiI+PC9jaXJjbGU+CiAgICAg' +
  'ICAgICAgICAgICAgPHBhdGggaWQ9IlVwbG9hZC1BcnJvdyIgZD0iTTIwLDEyIEwyMCwyOCBNMTIsMjAgTDIwLDEyIEwyOCwy' +
  'MCIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVq' +
  'b2luPSJyb3VuZCIgZmlsbD0ibm9uZSIvPgogICAgICAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=';

/**
 * Class for the Aliyun OSS-related blocks in Scratch 3.0
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */
class Scratch3OSSBlocks {
  constructor(runtime) {
    /**
     * The runtime instantiating this block package.
     * @type {Runtime}
     */
    this.runtime = runtime;

    /**
     * OSS configuration
     * @type {Object}
     * @private
     */
    this._ossConfig = {
      region: '',
      accessKeyId: '',
      accessKeySecret: '',
      bucket: ''
    };

    /**
     * Upload status
     * @type {string}
     * @private
     */
    this._uploadStatus = '未开始';
  }

  /**
   * Get the Scratch 3.0 blocks provided by this package.
   * @return {Array} Array of blocks, each block definition object.
   */
  getInfo() {
    return {
      id: 'oss',
      name: '阿里云OSS',
      menuIconURI: menuIconURI,
      blockIconURI: blockIconURI,
      blocks: [
        {
          opcode: 'uploadToOSS',
          blockType: BlockType.COMMAND,
          text: formatMessage({
            id: 'oss.uploadToOSS',
            default: '上传到OSS [REGION] [ACCESS_KEY_ID] [ACCESS_KEY_SECRET] ' +
              '[BUCKET] [OBJECT_KEY] [BASE64_DATA]',
            description: 'Upload base64 data to OSS'
          }),
          arguments: {
            REGION: {
              type: ArgumentType.STRING,
              defaultValue: 'oss-cn-hangzhou'
            },
            ACCESS_KEY_ID: {
              type: ArgumentType.STRING,
              defaultValue: 'your-access-key-id'
            },
            ACCESS_KEY_SECRET: {
              type: ArgumentType.STRING,
              defaultValue: 'your-access-key-secret'
            },
            BUCKET: {
              type: ArgumentType.STRING,
              defaultValue: 'your-bucket-name'
            },
            OBJECT_KEY: {
              type: ArgumentType.STRING,
              defaultValue: 'folder/file.png'
            },
            BASE64_DATA: {
              type: ArgumentType.STRING,
              defaultValue: 'data:image/png;base64,' +
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhf' +
                'DwAChwGA60e6kgAAAABJRU5ErkJggg=='
            }
          }
        },
        {
          opcode: 'testCORS',
          blockType: BlockType.COMMAND,
          text: formatMessage({
            id: 'oss.testCORS',
            default: '测试CORS连接 [BUCKET] [REGION]',
            description: 'Test CORS connection to OSS bucket'
          }),
          arguments: {
            BUCKET: {
              type: ArgumentType.STRING,
              defaultValue: 'robot-see'
            },
            REGION: {
              type: ArgumentType.STRING,
              defaultValue: 'oss-cn-shanghai'
            }
          }
        }
      ]
    };
  }

  /**
   * Upload base64 data to OSS using direct HTTP request
   * @param {object} args - the arguments
   */
  uploadToOSS(args) {
    const region = Cast.toString(args.REGION);
    const accessKeyId = Cast.toString(args.ACCESS_KEY_ID);
    const accessKeySecret = Cast.toString(args.ACCESS_KEY_SECRET);
    const bucket = Cast.toString(args.BUCKET);
    const objectKey = Cast.toString(args.OBJECT_KEY);
    const base64Data = Cast.toString(args.BASE64_DATA);

    this._uploadStatus = '上传中...';

    try {
      // 转换 base64 数据为 Buffer
      const dataBuffer = this._base64ToBuffer(base64Data);

      // 使用直接HTTP请求上传到OSS
      this._uploadToOSSWithHTTP(region, accessKeyId, accessKeySecret, bucket, objectKey, dataBuffer)
        .catch(error => {
          this._uploadStatus = `上传失败：${error.message}`;
          console.error('OSS上传错误:', error);
        });
    } catch (error) {
      this._uploadStatus = `错误：${error.message}`;
      console.error('OSS配置错误:', error);
    }
  }

  /**
   * Test CORS connection to OSS bucket
   * @param {object} args - the arguments
   */
  testCORS(args) {
    const bucket = Cast.toString(args.BUCKET);
    const region = Cast.toString(args.REGION);

    this._uploadStatus = '测试CORS连接中...';

    // 测试CORS连接
    this._testCORSConnection(bucket, region)
      .catch(error => {
        this._uploadStatus = `CORS测试失败：${error.message}`;
        console.error('CORS测试错误:', error);
      });
  }

  /**
   * Upload to OSS using direct HTTP request with signature
   * @param {string} region - OSS region
   * @param {string} accessKeyId - Access Key ID
   * @param {string} accessKeySecret - Access Key Secret
   * @param {string} bucket - Bucket name
   * @param {string} objectKey - Object key
   * @param {Buffer} dataBuffer - Data to upload
   * @private
   */
  async _uploadToOSSWithHTTP(region, accessKeyId, accessKeySecret, bucket, objectKey, dataBuffer) {
    try {
      // 构建OSS endpoint
      const endpoint = `https://${bucket}.${region}.aliyuncs.com`;
      const url = `${endpoint}/${objectKey}`;

      // 生成签名
      const signature = await this._generateOSSSignature('PUT', objectKey, accessKeySecret, bucket, region);

      // 设置请求头，添加CORS相关头
      const headers = {
        'Authorization': `OSS ${accessKeyId}:${signature}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': dataBuffer.length.toString(),
        'Access-Control-Request-Method': 'PUT',
        'Access-Control-Request-Headers': 'authorization,content-type,content-length'
      };

      // 使用fetch进行上传，添加mode和credentials配置
      const response = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: dataBuffer,
        mode: 'cors', // 明确指定CORS模式
        credentials: 'omit' // 不发送cookies
      });

      if (response.ok) {
        this._uploadStatus = '上传成功';
        console.log('OSS上传成功:', response.status);
        const result = await response.text();
        console.log('OSS上传结果:', result);
      } else {
        // 检查是否是CORS错误
        if (response.status === 0 || response.type === 'opaque') {
          throw new Error('CORS错误：请检查OSS存储桶的跨域配置');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // 检查是否是网络或CORS相关错误
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        this._uploadStatus = '网络错误：请检查CORS配置或网络连接';
        console.error('网络/CORS错误:', error);
      } else {
        this._uploadStatus = `上传失败：${error.message}`;
        console.error('OSS上传错误:', error);
      }
    }
  }

  /**
   * Generate OSS signature for authentication using Web Crypto API
   * @param {string} method - HTTP method
   * @param {string} objectKey - Object key
   * @param {string} accessKeySecret - Access Key Secret
   * @param {string} bucket - Bucket name
   * @param {string} region - OSS region
   * @return {Promise<string>} Base64 encoded signature
   * @private
   */
  async _generateOSSSignature(method, objectKey, accessKeySecret, bucket) {
    const date = new Date().toUTCString();
    const stringToSign = `${method}\n\napplication/octet-stream\n${date}\n/${bucket}/${objectKey}`;

    // 使用Web Crypto API生成HMAC-SHA1签名
    const encoder = new TextEncoder();
    const keyData = encoder.encode(accessKeySecret);
    const messageData = encoder.encode(stringToSign);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, messageData);
    const signatureArray = new Uint8Array(signature);
    const base64Signature = btoa(String.fromCharCode.apply(null, signatureArray));

    return base64Signature;
  }

  /**
   * Test CORS connection to OSS bucket
   * @param {string} bucket - Bucket name
   * @param {string} region - OSS region
   * @private
   */
  async _testCORSConnection(bucket, region) {
    try {
      // 构建测试URL
      const endpoint = `https://${bucket}.${region}.aliyuncs.com`;
      const testUrl = `${endpoint}/white.png`;

      console.log('测试CORS连接:', testUrl);

      // 发送OPTIONS预检请求
      const optionsResponse = await fetch(testUrl, {
        method: 'OPTIONS',
        mode: 'cors',
        headers: {
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'authorization,content-type'
        }
      });

      console.log('OPTIONS响应状态:', optionsResponse.status);
      console.log('OPTIONS响应头:', Object.fromEntries(optionsResponse.headers.entries()));

      // 检查CORS头
      const corsHeaders = {
        'Access-Control-Allow-Origin': optionsResponse.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': optionsResponse.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': optionsResponse.headers.get('Access-Control-Allow-Headers')
      };

      console.log('CORS头信息:', corsHeaders);

      if (corsHeaders['Access-Control-Allow-Origin']) {
        this._uploadStatus = 'CORS连接正常';
        console.log('CORS配置正确');
      } else {
        this._uploadStatus = 'CORS配置缺失：请配置存储桶跨域设置';
        console.warn('CORS配置缺失');
      }

      // 尝试发送GET请求
      const getResponse = await fetch(testUrl, {
        method: 'GET',
        mode: 'cors'
      });

      console.log('GET响应状态:', getResponse.status);

      if (getResponse.ok) {
        this._uploadStatus = 'CORS连接正常，文件可访问';
      } else {
        this._uploadStatus = `CORS连接正常，但文件访问失败：${getResponse.status}`;
      }
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        this._uploadStatus = 'CORS连接失败：请检查存储桶跨域配置';
        console.error('CORS连接失败:', error);
      } else {
        this._uploadStatus = `CORS测试错误：${error.message}`;
        console.error('CORS测试错误:', error);
      }
    }
  }

  /**
   * Convert base64 data to buffer
   * @param {string} base64Data - Base64 data string (with or without data URI prefix)
   * @return {Buffer} Buffer containing the data
   * @private
   */
  _base64ToBuffer(base64Data) {
    try {
      // 移除 data URI 前缀（如果存在）
      let base64String = base64Data;
      if (base64Data.includes(',')) {
        base64String = base64Data.split(',')[1];
      }

      // 验证 base64 字符串不为空
      if (!base64String || base64String.trim() === '') {
        throw new Error('Base64 数据为空');
      }

      // 使用正确导入的 Buffer.from 转换 base64 数据
      return Buffer.from(base64String, 'base64');
    } catch (error) {
      throw new Error(`Base64 转换失败：${error.message}`);
    }
  }
}

module.exports = Scratch3OSSBlocks;
