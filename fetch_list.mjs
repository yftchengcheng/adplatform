import { FetchClient, Config } from 'coze-coding-dev-sdk';

const config = new Config();
const client = new FetchClient(config);

const docUrl = 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F%E7%BB%84%E4%BB%B6%E5%88%97%E8%A1%A8.docx&nonce=3aa2408c-1d49-4bbe-902f-ff7b29e7b93a&project_id=7628071345674895423&sign=0f2d9e6301caf116dab1a002c62fe6b987feeb0e095f3e8a6d88c2aeabd62c6d';

const response = await client.fetch(docUrl);
console.log(JSON.stringify(response, null, 2));
