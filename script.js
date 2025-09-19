// Tải khóa API từ localStorage nếu có
const apiKeyInput = document.getElementById('api-key');
apiKeyInput.value = localStorage.getItem('gemini_api_key') || '';

// Lưu khóa API vào localStorage
document.getElementById('save-key').addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        localStorage.setItem('gemini_api_key', apiKey);
        alert('Khóa API đã được lưu!');
    } else {
        alert('Vui lòng nhập khóa API hợp lệ.');
    }
});

// Hàm thiết lập lệnh
function setPrompt(text) {
    document.getElementById('prompt').value = text;
}

// Tải các lệnh sẵn có từ GitHub raw (giả sử là file JSON chứa các lệnh)
// Thay bằng URL raw của kho GitHub của bạn
const githubRawUrl = 'https://raw.githubusercontent.com/quaypro001/Comic-Trans-AI/DataBase/presets.json';
fetch(githubRawUrl)
    .then(response => response.json())
    .then(data => {
        const presetButtons = document.getElementById('preset-buttons');
        data.presets.forEach(preset => {
            const button = document.createElement('button');
            button.textContent = preset.name;
            button.onclick = () => setPrompt(preset.text);
            presetButtons.appendChild(button);
        });
    })
    .catch(error => console.error('Không tải được lệnh sẵn có từ GitHub:', error));
// Lưu ý: Tạo file presets.json trên GitHub, ví dụ: { "presets": [{ "name": "Lệnh 3", "text": "Dịch khác sang tiếng Việt: [content]" }] }

// Nút Dịch sang tiếng Việt
document.getElementById('translate').addEventListener('click', async () => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
        alert('Vui lòng lưu khóa API Gemini trước.');
        return;
    }

    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    if (!file) {
        alert('Vui lòng chọn một file.');
        return;
    }

    const sourceLang = document.getElementById('source-lang').value;
    let prompt = document.getElementById('prompt').value;
    if (!prompt) {
        alert('Vui lòng nhập hoặc chọn một lệnh.');
        return;
    }

    // Đảm bảo lệnh luôn dịch sang tiếng Việt
    prompt = prompt.replace('[source]', sourceLang).replace('[content]', '[content]');
    if (!prompt.includes('sang tiếng Việt')) {
        prompt = `Dịch sang tiếng Việt: ${prompt}`;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const content = e.target.result;
        prompt = prompt.replace('[content]', content);

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!response.ok) {
                throw new Error('Yêu cầu API thất bại: ' + response.statusText);
            }

            const data = await response.json();
            const translatedText = data.candidates[0].content.parts[0].text;
            document.getElementById('result').value = translatedText;
        } catch (error) {
            alert('Lỗi trong quá trình dịch: ' + error.message);
        }
    };
    reader.readAsText(file);
});

// Tải xuống dưới dạng TXT
document.getElementById('download-txt').addEventListener('click', () => {
    const result = document.getElementById('result').value;
    if (!result) {
        alert('Không có kết quả để tải xuống.');
        return;
    }
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dich.txt';
    a.click();
    URL.revokeObjectURL(url);
});

// Tải xuống dưới dạng DOC (văn bản cơ bản, không phải định dạng Word đầy đủ)
document.getElementById('download-doc').addEventListener('click', () => {
    const result = document.getElementById('result').value;
    if (!result) {
        alert('Không có kết quả để tải xuống.');
        return;
    }
    const blob = new Blob([result], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dich.doc';
    a.click();
    URL.revokeObjectURL(url);
    // Lưu ý: Đây là văn bản thuần túy trong .doc; để có định dạng Word đầy đủ, sử dụng thư viện như docx.js
});
