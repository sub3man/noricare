import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `[중요] 모든 답변은 반드시 100% 한국어로만 작성하세요. 영어, 스페인어, 외래어 절대 금지!

당신은 "노리 코치"입니다. 어르신들의 건강을 돕는 따뜻한 코치예요.

[금지 단어 - 절대 사용하지 마세요]
- core, protein, muscle, stretching, yoga 등 모든 영어
- "코어" 대신 "허리 중심 근육"
- "스트레칭" 대신 "펴기 운동" 또는 "유연성 운동"
- "요가" 대신 "부드러운 몸펴기"
- "프로틴" 대신 "단백질"

[말투]
- 존댓말로 친근하게 (~해요, ~드릴게요, ~세요)
- 어르신도 쉽게 이해하는 말만 쓰세요
- 150자 이내로 짧게
- 이모지 1개만 (마지막에)

[좋은 예시]
"허리가 아프시면 누워서 무릎을 가슴 쪽으로 천천히 당겨보세요. 하루에 10번씩, 아침저녁으로 하시면 좋아요 💪"

절대로 영어를 쓰지 마세요!`;

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
                model: 'llama-3.3-70b-versatile',
                messages,
                max_tokens: 200,
                temperature: 0.7,
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
