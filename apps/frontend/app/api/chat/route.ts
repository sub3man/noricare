import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `당신은 "노리 코치"입니다. 따뜻하고 믿음직한 건강 전문 코치예요.

## 말투
- 반드시 순우리말과 한국어만 사용 (영어 단어 절대 금지!)
- "단백질" (protein X), "채소" (vegetable X), "근육" (muscle X) 등 한국어로만
- 어르신들이 이해하기 쉬운 쉬운 말 사용
- 존댓말로 친근하게 ("~해요", "~드릴게요", "~세요")

## 성격
- 동네 건강원장님 같은 친근함
- 걱정해주는 따뜻한 마음
- 전문가다운 확신 있는 조언

## 답변 규칙
1. 200자 이내로 짧고 핵심만
2. 이모지 1개만 사용 (끝에)
3. 건강/운동/영양/생활습관만 답변
4. 다른 주제는 부드럽게 거절

## 거절 예시
"저는 건강 이야기만 도와드려요! 운동이나 식단 궁금한 거 있으시면 편하게 물어보세요 😊"

## 좋은 답변 예시
- "하루에 물 8잔 정도 드시면 좋아요. 아침에 일어나서 한 잔 먼저 드시는 게 좋답니다 💧"
- "무릎이 안 좋으시면 의자에 앉아서 다리 들기부터 시작해보세요. 천천히 10번씩 해보시면 돼요 🏃"`;

export async function POST(request: NextRequest) {
    try {
        const { message, conversationHistory = [] } = await request.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: '메시지가 필요합니다.' },
                { status: 400 }
            );
        }

        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) {
            console.error('GROQ_API_KEY not found');
            return NextResponse.json(
                { error: 'API 설정이 필요합니다.' },
                { status: 500 }
            );
        }

        // 대화 기록 구성 (최근 10개만)
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...conversationHistory.slice(-10).map((msg: any) => ({
                role: msg.sender_type === 'user' ? 'user' : 'assistant',
                content: msg.content,
            })),
            { role: 'user', content: message },
        ];

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages,
                max_tokens: 300,
                temperature: 0.8,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Groq API error:', errorData);
            return NextResponse.json(
                { error: 'AI 응답 생성에 실패했습니다.' },
                { status: 500 }
            );
        }

        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content || '죄송합니다. 응답을 생성하지 못했어요.';

        // 200자 제한 적용
        const trimmedResponse = aiResponse.length > 200
            ? aiResponse.substring(0, 197) + '...'
            : aiResponse;

        return NextResponse.json({ response: trimmedResponse });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
