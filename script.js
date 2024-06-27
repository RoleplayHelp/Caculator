const STAT_CONSTANTS = Object.freeze({
    MIN_HP_RATIO: 0.2,
    MIN_SPEED_RATIO: 0.05,
    MAX_SPEED_RATIO: 0.6
});

const elementColors = {
    force: '#8A2BE2',  // BlueViolet
    flame: '#FF4500',  // OrangeRed
    aqua: '#1E90FF',   // DodgerBlue
    gale: '#32CD32',   // LimeGreen
    terra: '#8B4513',  // SaddleBrown
    holy: '#FFD700',   // Gold
    shadow: '#4B0082'  // Indigo
};

const elements = ['force', 'flame', 'aqua', 'gale', 'terra', 'holy', 'shadow'];
let remainingAffinity = 7;

const formatNumber = num => num % 1 === 0 ? num.toString() : num.toFixed(1);

const displayError = (elementId, message) => {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = message ? 'block' : 'none';
    }
};

const updateStatInputs = function() {
    const total = parseFloat(this.value) || 0;
    const statInputs = document.getElementById('stat-inputs');
    const statSummary = document.getElementById('stat-summary');
    const remainingTotal = document.getElementById('remaining-total');
    const hpInput = document.getElementById('hp');
    const speedInput = document.getElementById('speed');

    ['hp', 'power', 'speed', 'shielding', 'recovery'].forEach(id => {
        const input = document.getElementById(id);
        input.value = '';
        input.placeholder = '';
    });

    displayError('total-error', '');

    if (total > 0) {
        statInputs.style.display = 'block';
        statSummary.style.display = 'flex';
        remainingTotal.textContent = formatNumber(total);

        const requiredHp = formatNumber(total * STAT_CONSTANTS.MIN_HP_RATIO);
        hpInput.placeholder = `Yêu cầu HP thấp nhất = ${requiredHp}`;

        const minSpeed = formatNumber(total * STAT_CONSTANTS.MIN_SPEED_RATIO);
        const maxSpeed = formatNumber(total * STAT_CONSTANTS.MAX_SPEED_RATIO);
        speedInput.placeholder = `Speed nằm trong khoảng: ${minSpeed} - ${maxSpeed}`;

        document.getElementById('power').placeholder = 'Nhập Power cho nhân vật';
        document.getElementById('shielding').placeholder = 'Nhập giá trị ShD cho nhân vật, thường Shielder dùng stat này';
        document.getElementById('recovery').placeholder = 'Nhập giá trị Rec cho nhân vật, thường Healer dùng stat này';
    } else {
        statInputs.style.display = 'none';
        statSummary.style.display = 'none';
    }

    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });

    updateCopyButtonVisibility();
};

const validateStats = event => {
    const total = parseFloat(document.getElementById('total').value) || 0;
    const hp = parseFloat(document.getElementById('hp').value) || 0;
    const power = parseFloat(document.getElementById('power').value) || 0;
    const speed = parseFloat(document.getElementById('speed').value) || 0;
    const shielding = parseFloat(document.getElementById('shielding').value) || 0;
    const recovery = parseFloat(document.getElementById('recovery').value) || 0;

    let isValid = true;
    let errorMessage = '';

    ['hp', 'power', 'speed', 'shielding', 'recovery', 'total'].forEach(id => {
        displayError(`${id}-error`, '');
    });

    const requiredHp = total * STAT_CONSTANTS.MIN_HP_RATIO;
    if (hp < requiredHp) {
        errorMessage = `HP must be at least ${formatNumber(requiredHp)}.`;
        displayError('hp-error', errorMessage);
        isValid = false;
    }

    const minSpeed = total * STAT_CONSTANTS.MIN_SPEED_RATIO;
    const maxSpeed = total * STAT_CONSTANTS.MAX_SPEED_RATIO;
    if (speed < minSpeed || speed > maxSpeed) {
        errorMessage = `Speed must be between ${formatNumber(minSpeed)} and ${formatNumber(maxSpeed)}.`;
        displayError('speed-error', errorMessage);
        isValid = false;
    }

    const totalStats = hp + power + speed + shielding + recovery;
    const remainingStat = total - totalStats;

    document.getElementById('remaining-total').textContent = formatNumber(remainingStat);

    if (totalStats > total) {
        errorMessage = `Total stats exceed Base Stat (${formatNumber(totalStats)}/${formatNumber(total)})`;
        displayError('total-error', errorMessage);
        isValid = false;
    }

    updateInputValues(total, hp, power, speed, shielding, recovery);

    const showSummary = isValid && (remainingStat === 0) && (total > 0);
    document.getElementById('input-values').style.display = showSummary ? 'block' : 'none';
    
    updateCopyButtonVisibility();
};

const updateInputValues = (total, hp, power, speed, shielding, recovery) => {
    const baseHp = hp * 10;
    const rangeLimit = total;
    const healingLimit = baseHp * 0.2;

    document.getElementById('input-total').textContent = formatNumber(total);
    document.getElementById('input-hp').textContent = `${formatNumber(hp)}*10 = ${formatNumber(baseHp)}`;
    document.getElementById('input-power').textContent = formatNumber(power);
    document.getElementById('input-speed').textContent = formatNumber(speed);
    document.getElementById('input-shielding').textContent = formatNumber(shielding);
    document.getElementById('input-recovery').textContent = formatNumber(recovery);
    document.getElementById('input-range-limit').textContent = `${formatNumber(rangeLimit)}`;
    document.getElementById('input-healing-limit').textContent = `${formatNumber(healingLimit)} HP`;
};

const copyValues = () => {
    const inputValues = document.getElementById('input-values');
    const allLines = inputValues.innerText.split('\n');
    
    // Loại bỏ dòng trống và dòng chỉ chứa khoảng trắng
    const filteredLines = allLines.filter(line => line.trim() !== '');
    
    // Tìm vị trí của "Elemental Affinity"
    const affinityIndex = filteredLines.findIndex(line => line.includes('Elemental Affinity'));
    
    // Tạo chuỗi kết quả với một dòng trống giữa stats và affinity
    let result = filteredLines.slice(0, affinityIndex).join('\n');
    result += '\n\n' + filteredLines.slice(affinityIndex).join('\n');

    navigator.clipboard.writeText(result)
        .then(() => {
            const successMessage = document.createElement('p');
            successMessage.classList.add('success-message');
            successMessage.textContent = 'Đã sao chép thông tin thành công! Bạn có thể dán vào profile.';
            document.getElementById('success-message').appendChild(successMessage);

            setTimeout(() => successMessage.remove(), 3000);
        })
        .catch(err => console.error('Failed to copy text: ', err));
};

function initializeAffinity() {
    elements.forEach(element => {
        document.getElementById(`${element}-affinity`).value = "0.0";
    });
    updateAllAffinities();
}

function updateAllAffinities() {
    elements.forEach(element => {
        const value = parseFloat(document.getElementById(`${element}-affinity`).value) || 0;
        updateAffinityDescription(element, value);
    });
    updateRemainingAffinity();
    updateAffinitySummary();
}

function updateAffinityDescription(element, value) {
    const description = document.getElementById(`${element}-description`);
    const elementName = element.charAt(0).toUpperCase() + element.slice(1);

    if (value === 1) {
        description.textContent = '';
    } else if (value > 1) {
        const increase = ((value - 1) * 100).toFixed(1);
        description.textContent = `Sát thương bạn nhận từ hệ ${elementName} tăng ${increase}%`;
    } else if (value < 0) {
        const healRatio = Math.abs(value);
        description.textContent = `Bạn hấp thụ sát thương từ hệ ${elementName} và chuyển hóa thành HP với tỉ lệ 1 dmg hồi ${healRatio.toFixed(1)}HP`;
    } else if (value === 0) {
        description.textContent = `Bạn miễn nhiễm với sát thương hệ ${elementName}`;
    } else {
        const reductionRate = ((1 - value) * 100).toFixed(1);
        description.textContent = `Sát thương từ hệ ${elementName} giảm ${reductionRate}%`;
    }
}

function updateRemainingAffinity() {
    let total = 0;
    elements.forEach(element => {
        const value = parseFloat(document.getElementById(`${element}-affinity`).value) || 0;
        total += value;
    });
    remainingAffinity = 7 - total;
    document.getElementById('remaining-affinity').textContent = formatNumber(remainingAffinity);
    checkAffinityValidity();
}

function checkAffinityValidity() {
    const errorMessage = document.getElementById('affinity-error');
    if (remainingAffinity > 0) {
        errorMessage.textContent = 'Tổng Affinity không được thấp hơn 7.';
        errorMessage.style.display = 'block';
    } else {
        errorMessage.style.display = 'none';
    }
    updateCopyButtonVisibility();
}

function updateCopyButtonVisibility() {
    const copyButton = document.getElementById('copy-values');
    const statErrors = document.querySelectorAll('#calculator-form .error-message');
    const affinityError = document.getElementById('affinity-error');
    
    const hasStatErrors = Array.from(statErrors).some(error => error.style.display !== 'none');
    const hasAffinityError = affinityError.style.display !== 'none';

    if (!hasStatErrors && !hasAffinityError && remainingAffinity <= 0) {
        copyButton.style.display = 'block';
    } else {
        copyButton.style.display = 'none';
    }
}

function updateAffinitySummary() {
    const summary = document.getElementById('affinity-summary');
    summary.innerHTML = elements.map(element => {
        const value = parseFloat(document.getElementById(`${element}-affinity`).value) || 0;
        return `<p><span style="font-weight: bold;">${element.charAt(0).toUpperCase() + element.slice(1)} Affinity:</span> <span class="highlight">${value.toFixed(1)}</span></p>`;
    }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    const totalInput = document.getElementById('total');
    totalInput.addEventListener('input', updateStatInputs);
    totalInput.placeholder = "Thường giá trị là 200 cho đa số thành viên đăng ký mới.";

    ['hp', 'power', 'speed', 'shielding', 'recovery'].forEach(id => {
        document.getElementById(id).addEventListener('input', validateStats);
    });
    document.getElementById('copy-values').addEventListener('click', copyValues);

    document.getElementById('stat-inputs').style.display = 'none';
    document.getElementById('stat-summary').style.display = 'none';
    document.getElementById('input-values').style.display = 'none';
    document.getElementById('copy-values').style.display = 'none';

    initializeAffinity();
    elements.forEach(element => {
        const input = document.getElementById(`${element}-affinity`);
        input.addEventListener('input', () => {
            updateAffinityDescription(element, parseFloat(input.value) || 0);
            updateAllAffinities();
        });
    });
});
