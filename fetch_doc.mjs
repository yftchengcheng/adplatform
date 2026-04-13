import { FetchClient, Config } from 'coze-coding-dev-sdk';

const config = new Config();
const client = new FetchClient(config);

const docUrl = 'https://coze-coding-project.tos.coze.site/create_attachment/2026-04-13/3335283175079384_91e9ea145b57050f53e5c0945c084c59_%E9%80%89%E6%8B%A9%E7%A3%81%E8%B4%B4-%E7%BB%84%E4%BB%B6%E5%88%9B%E5%BB%BA.docx?sign=4898113894-f433341891-0-cc8cf4dcae18ae4ad68dd91d3a6c8a90002777984ff54c1afacc826bcfb65394';

const response = await client.fetch(docUrl);
console.log(JSON.stringify(response, null, 2));
