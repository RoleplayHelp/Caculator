const STAT_CONSTANTS = Object.freeze({
    MIN_HP_RATIO: 0.1,
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

function setupToggleSections() {
    document.querySelectorAll('.section-title').forEach(title => {
        title.addEventListener('click', function() {
            const sectionId = this.getAttribute('aria-controls');
            toggleSection(sectionId);
        });
    });
	
	const statBuilderSection = document.getElementById('stat-builder');
    if (statBuilderSection) {
        const headerDiv = document.createElement('div');
        headerDiv.className = 'form-header';
        headerDiv.innerHTML = `
            <h3>Xây dựng chỉ số</h3>
            <button type="button" id="stat-builder-help" class="help-button">Help</button>
        `;
        statBuilderSection.insertBefore(headerDiv, statBuilderSection.firstChild);

        document.getElementById('stat-builder-help').addEventListener('click', showStatBuilderHelp);
    }
}

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const title = document.querySelector(`[aria-controls="${sectionId}"]`);
    const isExpanded = title.getAttribute('aria-expanded') === 'true';

    section.style.display = isExpanded ? 'none' : 'block';
    title.setAttribute('aria-expanded', !isExpanded);
    title.querySelector('.toggle-icon').style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
}

function setupCharacterInfo() {
    const nevaOrigin = document.getElementById('neva-origin');
    const nevaInspiration = document.getElementById('neva-inspiration');
    
    nevaOrigin.addEventListener('change', function() {
        nevaInspiration.style.display = this.value === 'Character' ? 'block' : 'none';
    });

    document.getElementById('copy-operator-info').addEventListener('click', copyOperatorInfo);
    document.getElementById('copy-neva-info').addEventListener('click', copyNevaInfo);
    document.getElementById('copy-all-info').addEventListener('click', copyAllInfo);

    const nevaIdInput = document.getElementById('neva-id');
    nevaIdInput.addEventListener('input', validateNevaId);
}

function validateNevaId() {
    const nevaIdInput = document.getElementById('neva-id');
    const nevaIdError = document.getElementById('neva-id-error');
    const idPattern = /^C3\d{6,}$/;

    if (!idPattern.test(nevaIdInput.value)) {
        nevaIdError.textContent = 'ID phải bắt đầu bằng C3 và theo sau bởi ít nhất 6 chữ số.';
        nevaIdInput.setCustomValidity('Invalid ID');
    } else {
        nevaIdError.textContent = '';
        nevaIdInput.setCustomValidity('');
    }
}

function validateRequiredFields(formId) {
    const form = document.getElementById(formId);
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
            const errorMessage = field.nextElementSibling || document.createElement('span');
            errorMessage.textContent = 'Trường này là bắt buộc';
            errorMessage.className = 'error-message';
            if (!field.nextElementSibling) {
                field.parentNode.insertBefore(errorMessage, field.nextSibling);
            }
        } else {
            field.classList.remove('error');
            if (field.nextElementSibling && field.nextElementSibling.className === 'error-message') {
                field.nextElementSibling.remove();
            }
        }
    });

    return isValid;
}

function copyOperatorInfo() {
    if (!validateRequiredFields('operator-form')) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc cho Operator');
        return;
    }

    let info = "";
    
    const operatorName = document.getElementById('operator-name').value;
    const operatorAge = document.getElementById('operator-age').value;
    const operatorGender = document.getElementById('operator-gender').value;
    const operatorBackground = document.getElementById('operator-background').value;
    const operatorPersonality = document.getElementById('operator-personality').value;
    const operatorAdditionalInfo = document.getElementById('operator-additional-info').value;

    if (operatorName) info += `Tên Operator: ${operatorName}\n`;
    if (operatorAge) info += `Tuổi: ${operatorAge}\n`;
    if (operatorGender) info += `Giới tính Operator: ${operatorGender}\n`;
    if (operatorBackground) info += `Background Operator: ${operatorBackground}\n`;
    if (operatorPersonality) info += `Tính cách Operator: ${operatorPersonality}\n`;
    if (operatorAdditionalInfo) info += `Thông tin thêm: ${operatorAdditionalInfo}\n`;

    copyToClipboard(info, 'Đã sao chép thông tin Operator thành công!', 'operator-info-success-message');
}

function copyNevaInfo() {
    if (!validateRequiredFields('neva-form')) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc cho Neva');
        return;
    }

    let info = "";

    const nevaId = document.getElementById('neva-id').value;
    const nevaName = document.getElementById('neva-name').value;
    const nevaGender = document.getElementById('neva-gender').value;
    const nevaOrigin = document.getElementById('neva-origin').value;
    const nevaInspiration = document.getElementById('neva-inspiration-text').value;
    const nevaPersonality = document.getElementById('neva-personality').value;
    const nevaBackground = document.getElementById('neva-background').value;

    if (nevaId) info += `ID Neva: ${nevaId}\n`;
    if (nevaName) info += `Tên Neva: ${nevaName}\n`;
    if (nevaGender) info += `Giới tính Neva: ${nevaGender}\n`;
    if (nevaOrigin) {
        info += `Nguồn gốc thiết kế: ${nevaOrigin}\n`;
        if (nevaOrigin === 'Character' && nevaInspiration) {
            info += `Lấy ý tưởng từ: ${nevaInspiration}\n`;
        }
    }
    if (nevaPersonality) info += `Tính cách Neva: ${nevaPersonality}\n`;
    if (nevaBackground) info += `Background Neva: ${nevaBackground}\n`;

    copyToClipboard(info, 'Đã sao chép thông tin Neva thành công!', 'neva-info-success-message');
}

function copyAllInfo() {
    const isOperatorValid = validateRequiredFields('operator-form');
    const isNevaValid = validateRequiredFields('neva-form');

    if (!isOperatorValid && !isNevaValid) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc cho cả Operator và Neva');
        return;
    } else if (!isOperatorValid) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc cho Operator');
        return;
    } else if (!isNevaValid) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc cho Neva');
        return;
    }

    let info = "";
    
    // Operator info
    const operatorName = document.getElementById('operator-name').value;
    const operatorAge = document.getElementById('operator-age').value;
    const operatorGender = document.getElementById('operator-gender').value;
    const operatorBackground = document.getElementById('operator-background').value;
    const operatorPersonality = document.getElementById('operator-personality').value;
    const operatorAdditionalInfo = document.getElementById('operator-additional-info').value;

    info += "Thông tin Operator:\n";
    if (operatorName) info += `Tên Operator: ${operatorName}\n`;
    if (operatorAge) info += `Tuổi: ${operatorAge}\n`;
    if (operatorGender) info += `Giới tính Operator: ${operatorGender}\n`;
    if (operatorBackground) info += `Background Operator: ${operatorBackground}\n`;
    if (operatorPersonality) info += `Tính cách Operator: ${operatorPersonality}\n`;
    if (operatorAdditionalInfo) info += `Thông tin thêm: ${operatorAdditionalInfo}\n`;

    info += '\n';

    // Neva info
    const nevaId = document.getElementById('neva-id').value;
    const nevaName = document.getElementById('neva-name').value;
    const nevaGender = document.getElementById('neva-gender').value;
    const nevaOrigin = document.getElementById('neva-origin').value;
    const nevaInspiration = document.getElementById('neva-inspiration-text').value;
    const nevaPersonality = document.getElementById('neva-personality').value;
    const nevaBackground = document.getElementById('neva-background').value;

    info += "Thông tin Neva:\n";
    if (nevaId) info += `ID Neva: ${nevaId}\n`;
    if (nevaName) info += `Tên Neva: ${nevaName}\n`;
    if (nevaGender) info += `Giới tính Neva: ${nevaGender}\n`;
    if (nevaOrigin) {
        info += `Nguồn gốc thiết kế: ${nevaOrigin}\n`;
        if (nevaOrigin === 'Character' && nevaInspiration) {
            info += `Lấy ý tưởng từ: ${nevaInspiration}\n`;
        }
    }
    if (nevaPersonality) info += `Tính cách Neva: ${nevaPersonality}\n`;
    if (nevaBackground) info += `Background Neva: ${nevaBackground}\n`;

    copyToClipboard(info, 'Đã sao chép tất cả thông tin thành công!', 'all-info-success-message');
}

function copyToClipboard(text, successMessage, elementId) {
    navigator.clipboard.writeText(text.trim())
        .then(() => {
            const successElement = document.createElement('p');
            successElement.classList.add('success-message');
            successElement.textContent = successMessage;
            const messageContainer = document.getElementById(elementId);
            if (messageContainer) {
                messageContainer.innerHTML = '';
                messageContainer.appendChild(successElement);
            }

            // Hiển thị nhắc nhở về ảnh
            const imageReminder = document.getElementById('image-reminder');
            if (imageReminder) {
                imageReminder.style.display = 'block';
            }

            setTimeout(() => {
                if (successElement.parentNode) {
                    successElement.parentNode.removeChild(successElement);
                }
                if (imageReminder) {
                    imageReminder.style.display = 'none';
                }
            }, 5000);
        })
        .catch(err => console.error('Failed to copy text: ', err));
}

function initializeAffinity() {
    elements.forEach(element => {
        const input = document.getElementById(`${element}-affinity`);
        if (input) {
            input.value = "1.0";
        }
    });
    updateAllAffinities();
}

function updateAllAffinities() {
    elements.forEach(element => {
        const input = document.getElementById(`${element}-affinity`);
        if (input) {
            const value = parseFloat(input.value) || 0;
            updateAffinityDescription(element, value);
        }
    });
    updateRemainingAffinity();
    updateAffinitySummary();
}

function updateAffinityDescription(element, value) {
    const description = document.getElementById(`${element}-description`);
    if (!description) return;

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
        const input = document.getElementById(`${element}-affinity`);
        if (input) {
            const value = parseFloat(input.value) || 0;
            total += value;
        }
    });
    remainingAffinity = 7 - total;
    const remainingAffinityElement = document.getElementById('remaining-affinity');
    if (remainingAffinityElement) {
        remainingAffinityElement.textContent = formatNumber(remainingAffinity);
    }
    checkAffinityValidity();
}

function checkAffinityValidity() {
    const errorMessage = document.getElementById('affinity-error');
    if (errorMessage) {
        if (remainingAffinity > 0) {
            errorMessage.textContent = 'Tổng Affinity không được thấp hơn 7.';
            errorMessage.style.display = 'block';
        } else {
            errorMessage.style.display = 'none';
        }
    }
    updateCopyButtonVisibility();
}

function updateAffinitySummary() {
    const summary = document.getElementById('affinity-summary');
    if (summary) {
        summary.innerHTML = elements.map(element => {
            const input = document.getElementById(`${element}-affinity`);
            const value = input ? (parseFloat(input.value) || 0) : 0;
            return `<p><span style="font-weight: bold;">${element.charAt(0).toUpperCase() + element.slice(1)} Affinity:</span> <span class="highlight">${value.toFixed(1)}</span></p>`;
        }).join('');
    }
}

function updateCopyButtonVisibility() {
    const copyButton = document.getElementById('copy-values');
    if (copyButton) {
        const statErrors = document.querySelectorAll('#calculator-form .error-message');
        const affinityError = document.getElementById('affinity-error');
        
        const hasStatErrors = Array.from(statErrors).some(error => error.style.display !== 'none');
        const hasAffinityError = affinityError && affinityError.style.display !== 'none';

        if (!hasStatErrors && !hasAffinityError && remainingAffinity <= 0) {
            copyButton.style.display = 'block';
        } else {
            copyButton.style.display = 'none';
        }
    }
}

function updateStatInputs() {
    const total = parseFloat(document.getElementById('total').value) || 0;
    const statInputs = document.getElementById('stat-inputs');
    const statSummary = document.getElementById('stat-summary');
    const remainingTotal = document.getElementById('remaining-total');
    const hpInput = document.getElementById('hp');
    const speedInput = document.getElementById('speed');

    ['hp', 'power', 'speed', 'shielding', 'recovery', 'reflex'].forEach(id => {
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
        document.getElementById('reflex').placeholder = 'Nhập Reflex cho nhân vật (tối thiểu 10)';
    } else {
        statInputs.style.display = 'none';
        statSummary.style.display = 'none';
    }

    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });

    updateCopyButtonVisibility();
}

function validateStats() {
    const total = parseFloat(document.getElementById('total').value) || 0;
    const hp = parseFloat(document.getElementById('hp').value) || 0;
    const power = parseFloat(document.getElementById('power').value) || 0;
    const speed = parseFloat(document.getElementById('speed').value) || 0;
    const shielding = parseFloat(document.getElementById('shielding').value) || 0;
    const recovery = parseFloat(document.getElementById('recovery').value) || 0;
    const reflex = parseFloat(document.getElementById('reflex').value) || 0;

    let isValid = true;
    let errorMessage = '';

    ['hp', 'power', 'speed', 'shielding', 'recovery', 'reflex', 'total'].forEach(id => {
        displayError(`${id}-error`, '');
    });

    const requiredHp = total * STAT_CONSTANTS.MIN_HP_RATIO;
    if (hp < requiredHp) {
        errorMessage = `Yêu cầu HP tối thiểu là ${formatNumber(requiredHp)}.`;
        displayError('hp-error', errorMessage);
        isValid = false;
    }

    const minSpeed = total * STAT_CONSTANTS.MIN_SPEED_RATIO;
    const maxSpeed = total * STAT_CONSTANTS.MAX_SPEED_RATIO;
    if (speed < minSpeed || speed > maxSpeed) {
        errorMessage = `Speed phải nằm trong khoảng ${formatNumber(minSpeed)} and ${formatNumber(maxSpeed)}.`;
        displayError('speed-error', errorMessage);
        isValid = false;
    }

    if (reflex < 10) {
        errorMessage = 'Reflex phải tối thiểu là 10.';
        displayError('reflex-error', errorMessage);
        isValid = false;
    }

    // Tính tổng stat bao gồm cả Ref
    const totalStats = hp + power + speed + shielding + recovery + reflex;
    const remainingStat = total - totalStats;

    document.getElementById('remaining-total').textContent = formatNumber(remainingStat);

    if (totalStats > total) {
        errorMessage = `Tổng chỉ số (bao gồm Ref) vượt quá Base Stat (${formatNumber(totalStats)}/${formatNumber(total)})`;
        displayError('total-error', errorMessage);
        isValid = false;
    } else if (totalStats < total) {
        errorMessage = `Tổng chỉ số (bao gồm Ref) chưa đủ Base Stat (${formatNumber(totalStats)}/${formatNumber(total)})`;
        displayError('total-error', errorMessage);
        isValid = false;
    }

    updateInputValues(total, hp, power, speed, shielding, recovery, reflex);

    const showSummary = isValid && (remainingStat === 0) && (total > 0);
    document.getElementById('input-values').style.display = showSummary ? 'block' : 'none';
    
    updateCopyButtonVisibility();
}

function updateInputValues(total, hp, power, speed, shielding, recovery, reflex) {
    const baseHp = hp * 10;
    const rangeLimit = total;
    const healingLimit = baseHp * 0.2;

    const updateElementText = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    };

    updateElementText('input-total', formatNumber(total));
    updateElementText('input-hp', `${formatNumber(hp)}*10 = ${formatNumber(baseHp)}`);
    updateElementText('input-power', formatNumber(power));
    updateElementText('input-speed', formatNumber(speed));
    updateElementText('input-shielding', formatNumber(shielding));
    updateElementText('input-recovery', formatNumber(recovery));
    updateElementText('input-reflex', formatNumber(reflex));
    updateElementText('input-range-limit', `${formatNumber(rangeLimit)}`);
    updateElementText('input-healing-limit', `${formatNumber(healingLimit)} HP`);
}

function copyValues() {
    const inputValues = document.getElementById('input-values');
    const allLines = inputValues.innerText.split('\n');
    
    // Loại bỏ dòng trống và dòng chỉ chứa khoảng trắng
    const filteredLines = allLines.filter(line => line.trim() !== '');
    
    // Tìm vị trí của "Elemental Affinity"
    const affinityIndex = filteredLines.findIndex(line => line.includes('Elemental Affinity'));
    
    // Tạo chuỗi kết quả với một dòng trống giữa stats và affinity
    let result = filteredLines.slice(0, affinityIndex).join('\n');
    result += '\n\n' + filteredLines.slice(affinityIndex).join('\n');

    copyToClipboard(result, 'Đã sao chép thông tin chỉ số thành công!', 'success-message');
}

function setupNevaSkillBuilder() {
    const skillBuilderSection = document.getElementById('skill-builder');
    if (skillBuilderSection) {
        // Tạo header với nút help
        const headerDiv = document.createElement('div');
        headerDiv.className = 'form-header';
        headerDiv.innerHTML = `
            <h3>Xây dựng kỹ năng cho Neva</h3>
            <button type="button" id="neva-skills-help" class="help-button">Help</button>
        `;
        skillBuilderSection.insertBefore(headerDiv, skillBuilderSection.firstChild);

        // Thêm event listener cho nút help
        const helpButton = document.getElementById('neva-skills-help');
        if (helpButton) {
            helpButton.addEventListener('click', showNevaSkillsHelp);
        }
    }

    const nevaClassSelect = document.getElementById('neva-class');
    const secondAttackElementGroup = document.getElementById('second-attack-element-group');
    const addSkillButton = document.getElementById('add-skill');
    const copyNevaSkillsButton = document.getElementById('copy-neva-skills');

    if (nevaClassSelect) {
        nevaClassSelect.addEventListener('change', function() {
            if (secondAttackElementGroup) {
                secondAttackElementGroup.style.display = this.value === 'Attacker' ? 'block' : 'none';
            }
        });
    }

    if (addSkillButton) {
        addSkillButton.addEventListener('click', addSkill);
    }

    if (copyNevaSkillsButton) {
        copyNevaSkillsButton.addEventListener('click', copyNevaSkills);
    }
}

function addSkill() {
    const skillsContainer = document.getElementById('skills-container');
    const skillIndex = skillsContainer.children.length + 1;

    const skillHTML = `
        <div class="skill-entry" data-skill-index="${skillIndex}">
            <h4>Skill ${skillIndex}</h4>
            <div class="form-group">
                <label for="skill-name-${skillIndex}">Tên skill (không bắt buộc):</label>
                <input type="text" id="skill-name-${skillIndex}" placeholder="Nhập tên skill">
            </div>
            <div class="form-group">
                <label for="skill-type-${skillIndex}">Dạng skill:</label>
                <select id="skill-type-${skillIndex}" required onchange="updateSkillFields(${skillIndex})">
                    <option value="">Chọn dạng skill</option>
                    <option value="Active">Active</option>
                    <option value="Buff">Buff</option>
                    <option value="Auto-active">Auto-active</option>
                    <option value="Passive">Passive</option>
                </select>
            </div>
            <div id="skill-extra-fields-${skillIndex}"></div>
            <div class="form-group skill-cost">
                <label>Skill Cost:</label>
                <input type="number" id="skill-cost-t-${skillIndex}" placeholder="T" min="1" required onchange="updateTotalSkillCost()">
                <input type="number" id="skill-cost-r-${skillIndex}" placeholder="R" min="0" required onchange="updateTotalSkillCost()">
            </div>
            <div class="form-group">
                <label for="skill-description-${skillIndex}">Mô tả skill:</label>
                <textarea id="skill-description-${skillIndex}" placeholder="Nhập mô tả chi tiết về skill" required></textarea>
            </div>
        </div>
    `;

    skillsContainer.insertAdjacentHTML('beforeend', skillHTML);
    updateTotalSkillCost();
}

function updateSkillFields(skillIndex) {
    const skillType = document.getElementById(`skill-type-${skillIndex}`).value;
    const extraFieldsContainer = document.getElementById(`skill-extra-fields-${skillIndex}`);
    
    let extraFieldsHTML = '';
    
    switch(skillType) {
        case 'Active':
            extraFieldsHTML = `
                <div class="form-group">
                    <label for="skill-cooldown-${skillIndex}">Cooldown (turn):</label>
                    <input type="number" id="skill-cooldown-${skillIndex}" required min="0">
                </div>
            `;
            break;
        case 'Buff':
        case 'Auto-active':
            extraFieldsHTML = `
                <div class="form-group">
                    <label for="skill-duration-${skillIndex}">Max Duration (turn):</label>
                    <input type="number" id="skill-duration-${skillIndex}" required min="0">
                </div>
                <div class="form-group">
                    <label for="skill-cooldown-${skillIndex}">Cooldown (turn):</label>
                    <input type="number" id="skill-cooldown-${skillIndex}" required min="0">
                </div>
            `;
            break;
        default:
            extraFieldsHTML = '';
    }
    
    extraFieldsContainer.innerHTML = extraFieldsHTML;
}

function updateTotalSkillCost() {
    let totalCost = 0;
    const skillEntries = document.querySelectorAll('.skill-entry');
    
    skillEntries.forEach(entry => {
        const tCost = parseInt(entry.querySelector('input[id^="skill-cost-t-"]').value) || 0;
        const rCost = parseInt(entry.querySelector('input[id^="skill-cost-r-"]').value) || 0;
        totalCost += tCost + rCost;
    });

    const totalCostElement = document.querySelector('#total-skill-cost span');
    totalCostElement.textContent = totalCost;
    
    if (totalCost > 8) {
        totalCostElement.style.color = 'red';
    } else {
        totalCostElement.style.color = '';
    }
}

function copyNevaSkills() {
    const nevaClass = document.getElementById('neva-class')?.value;
    const normalAttackElement = document.getElementById('normal-attack-element')?.value;
    const secondAttackElement = document.getElementById('second-attack-element')?.value;
    
    if (!nevaClass || !normalAttackElement) {
        alert('Vui lòng điền đầy đủ thông tin class và hệ đòn đánh thường.');
        return;
    }

    let skillsInfo = `Class: ${nevaClass}\n`;
    skillsInfo += `Hệ đòn đánh thường: ${normalAttackElement}\n`;
    if (nevaClass === 'Attacker' && secondAttackElement) {
        skillsInfo += `Hệ đòn đánh thường thứ 2: ${secondAttackElement}\n`;
    }
    skillsInfo += '\nKỹ năng:\n';

    const skillEntries = document.querySelectorAll('.skill-entry');
    let isValid = true;

    skillEntries.forEach((entry, index) => {
        const skillName = entry.querySelector(`#skill-name-${index + 1}`)?.value || '';
        const skillType = entry.querySelector(`#skill-type-${index + 1}`)?.value;
        const skillCostT = entry.querySelector(`#skill-cost-t-${index + 1}`)?.value;
        const skillCostR = entry.querySelector(`#skill-cost-r-${index + 1}`)?.value;
        const skillDescription = entry.querySelector(`#skill-description-${index + 1}`)?.value;

        if (!skillType || !skillCostT || !skillCostR || !skillDescription) {
            isValid = false;
            return;
        }

        skillsInfo += `\nSkill ${index + 1}${skillName ? ` - ${skillName}` : ''}:\n`;
        skillsInfo += `Dạng: ${skillType}\n`;
        
        if (skillType === 'Active') {
            const cooldown = entry.querySelector(`#skill-cooldown-${index + 1}`)?.value;
            if (!cooldown) {
                isValid = false;
                return;
            }
            skillsInfo += `Cooldown: ${cooldown} turn\n`;
        } else if (skillType === 'Buff' || skillType === 'Auto-active') {
            const duration = entry.querySelector(`#skill-duration-${index + 1}`)?.value;
            const cooldown = entry.querySelector(`#skill-cooldown-${index + 1}`)?.value;
            if (!duration || !cooldown) {
                isValid = false;
                return;
            }
            skillsInfo += `Max Duration: ${duration} turn\n`;
            skillsInfo += `Cooldown: ${cooldown} turn\n`;
        }
        
        skillsInfo += `Cost: T${skillCostT}R${skillCostR}\n`;
        skillsInfo += `Mô tả: ${skillDescription}\n`;
    });

    if (!isValid) {
        alert('Vui lòng điền đầy đủ thông tin cho tất cả các skill (trừ tên skill).');
        return;
    }

    copyToClipboard(skillsInfo, 'Đã sao chép thông tin kỹ năng Neva thành công!', 'neva-skills-success-message');
}

function showStatBuilderHelp() {
    const helpContent = `
        <p><strong style="color: #e74c3c;">Base Stat:</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Tổng chỉ số cơ bản của nhân vật, thường là 200.</span></p>

        <p><strong style="color: #2980b9;">HP:</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Máu của nhân vật, tối thiểu 10% của Base Stat.</span></p>

        <p><strong style="color: #27ae60;">Power:</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Sức mạnh tấn công và thể chất của nhân vật.</span></p>
		<span style="color: #34495e; padding-left: 15px;">1 Pow tương đương Nhân vật có thể nâng dữ liệu nặng 1TB mà không gặp khó khăn gì.</span></p>

        <p><strong style="color: #8e44ad;">Speed:</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Ảnh hưởng tới tốc độ di chuyển và tốc độ tấn công của nhân vật, nằm trong khoảng 5% đến 60% của Base Stat.</span></p>

        <p><strong style="color: #d35400;">Shielding (SHD):</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Cho phép nhân vật có khả năng tạo khiên từ xa với độ bền bằng giá trị ShD đăng ký trong phạm vi 50% arg tối đa xung quanh nhân vật. Mỗi turn dùng một lần.</span></p>

        <p><strong style="color: #16a085;">Recovery (REC):</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Cho phép nhân vật phục hồi HP của 2 đối tượng bất kỳ, giá trị bằng 25% REC. Mỗi turn dùng 1 lần.</span></p>

        <p><strong style="color: #c0392b;">Reflex (Ref):</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Phản xạ của nhân vật, tối thiểu là 10.</span></p>
		<span style="color: #34495e; padding-left: 15px;">Nhân vật có thể phản xạ với hành động có Speed thấp hơn 150% Ref đăng ký. </span></p>

        <p><strong style="color: #f39c12;">Elemental Affinity:</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Mức độ tương tác với các nguyên tố, tổng phải bằng 7.</span></p>

        <p style="background-color: #f1c40f; color: #000000; padding: 10px; border-radius: 5px;">
        <strong>Lưu ý:</strong> Tổng các chỉ số phải bằng Base Stat.</p>
    `;
    showModal('Hướng dẫn xây dựng chỉ số', helpContent);
}

function showNevaSkillsHelp() {
    const helpContent = `
        <p><strong style="color: #e74c3c;">Class:</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Chọn class của Neva. Class của nhân vật sẽ quyết định tới cách duyệt skill của admin.</span></p><br>

        <p><strong style="color: #2980b9;">Hệ đòn đánh thường:</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Chọn hệ nguyên tố cho đòn đánh thường.</span></p><br>

        <p><strong style="color: #27ae60;">Hệ đòn đánh thường thứ 2:</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Chỉ xuất hiện cho Attacker, cho phép chọn hệ thứ hai.</span></p><br>

        <h4 style="color: #8e44ad;">Kỹ năng:</h4>
        <ul style="color: #34495e; list-style-type: none; padding-left: 0;">
            <li><strong style="color: #d35400;">📌 Tên skill:</strong> Đặt tên cho kỹ năng (không bắt buộc).</li>
            <li><strong style="color: #16a085;">🔄 Dạng skill:</strong> Chọn loại kỹ năng (Active, Buff, Auto-active, Passive).</li>
            <li><strong style="color: #3498db;">⏱️ Cooldown:</strong> Số turn cần để sử dụng lại kỹ năng.</li>
            <li><strong style="color: #9b59b6;">⏳ Max Duration:</strong> Thời gian tối đa kỹ năng có hiệu lực (nếu áp dụng).</li>
            <li><strong style="color: #e67e22;">💎 Skill Cost:</strong>
                <ul style="list-style-type: none; padding-left: 20px;">
                    <li style="color: #c0392b; font-weight: bold;">Skill Cost cho phép số thập phân như 1.5, 2.3 cost</li>
                    <li><strong style="color: #f39c12;">T (Tier):</strong> Quyết định độ mạnh và đa dụng của kỹ năng.</li>
                    <li><strong style="color: #27ae60;">R (Resist):</strong> Quyết định độ bền của kỹ năng, dùng để chống lại các kỹ năng khoá, trigger và kỹ năng khắc chế.</li>
                </ul>
            </li>
            <li><strong style="color: #2c3e50;">📝 Mô tả skill:</strong> Mô tả chi tiết về cách hoạt động của kỹ năng.</li>
        </ul>

        <p style="background-color: #f1c40f; color: #000000; padding: 10px; border-radius: 5px; font-weight: bold;">
        <strong>⚠️ Lưu ý:</strong> Tổng Skill Cost (T + R) không được vượt quá 8.</p>
    `;
    showModal('Hướng dẫn xây dựng kỹ năng Neva', helpContent);
}

function showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>${title}</h2>
            <div class="modal-body">${content}</div>
        </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = function() {
        document.body.removeChild(modal);
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            document.body.removeChild(modal);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setupToggleSections();
    setupCharacterInfo();
    setupNevaSkillBuilder();
	
	initializeAffinity();

    const totalInput = document.getElementById('total');
    if (totalInput) {
        totalInput.addEventListener('input', updateStatInputs);
        totalInput.placeholder = "Thường giá trị là 200 cho đa số thành viên đăng ký mới.";
    }

    ['hp', 'power', 'speed', 'shielding', 'recovery', 'reflex'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', validateStats);
        }
    });

    const copyValuesButton = document.getElementById('copy-values');
    if (copyValuesButton) {
        copyValuesButton.addEventListener('click', copyValues);
    }

    initializeAffinity();
    elements.forEach(element => {
        const input = document.getElementById(`${element}-affinity`);
        if (input) {
            input.addEventListener('input', () => {
                updateAffinityDescription(element, parseFloat(input.value) || 0);
                updateAllAffinities();
            });
        }
    });

    // Ẩn các phần kết quả ban đầu
    document.getElementById('stat-inputs').style.display = 'none';
    document.getElementById('stat-summary').style.display = 'none';
    document.getElementById('input-values').style.display = 'none';
    document.getElementById('copy-values').style.display = 'none';
});