import { NextRequest, NextResponse } from 'next/server';
import { FetchClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

const config = new Config();
const client = new FetchClient(config);

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    // Extract forward headers for tracing
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    
    const response = await client.fetch(url, customHeaders);
    
    return NextResponse.json({
      success: response.status_code === 0,
      title: response.title,
      content: response.content,
      url: response.url,
      filetype: response.filetype,
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch URL' },
      { status: 500 }
    );
  }
}
