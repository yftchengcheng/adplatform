import { NextRequest, NextResponse } from 'next/server';
import { FetchClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

const config = new Config();
const client = new FetchClient(config);

// 15秒超时保护
const FETCH_TIMEOUT = 15000;

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    // Extract forward headers for tracing
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    
    // 创建超时Promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Fetch URL timeout")), FETCH_TIMEOUT);
    });

    // 并行执行查询和超时
    const responsePromise = client.fetch(url);
    const response = await Promise.race([responsePromise, timeoutPromise]);
    
    return NextResponse.json({
      success: response.status_code === 0,
      title: response.title,
      content: response.content,
      url: response.url,
      filetype: response.filetype,
    });
  } catch (error: any) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch URL' },
      { status: 500 }
    );
  }
}
