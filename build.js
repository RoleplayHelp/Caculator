// Constants and Global Variables
const STAT_CONSTANTS = Object.freeze({
    MIN_HP_RATIO: 0.1,
    MIN_SPEED_RATIO: 0.05,
    MAX_SPEED_RATIO: 0.6
});

const elementColors = {
    force: '#8A2BE2', flame: '#FF4500', aqua: '#1E90FF',
    gale: '#32CD32', terra: '#8B4513', holy: '#FFD700',
    shadow: '#4B0082'
};

const elements = ['force', 'flame', 'aqua', 'gale', 'terra', 'holy', 'shadow'];
let remainingAffinity = 7;

// Utility Functions
const formatNumber = num => num % 1 === 0 ? num.toString() : num.toFixed(1);

const displayError = (elementId, message) => {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = message ? 'block' : 'none';
    }
};

// Validation Functions
function validateHP(hp, total) {
    const minHP = total * STAT_CONSTANTS.MIN_HP_RATIO;
    if (hp < minHP) {
        displayError('hp-error', `HP phải ít nhất ${minHP.toFixed(1)} (${(STAT_CONSTANTS.MIN_HP_RATIO * 100).toFixed(1)}% của Base Stat)`);
        return false;
    }
    displayError('hp-error', '');
    return true;
}

function validateSpeed(speed, total) {
    const minSpeed = total * STAT_CONSTANTS.MIN_SPEED_RATIO;
    const maxSpeed = total * STAT_CONSTANTS.MAX_SPEED_RATIO;
    if (speed < minSpeed || speed > maxSpeed) {
        displayError('speed-error', `Speed phải nằm trong khoảng ${minSpeed.toFixed(1)} - ${maxSpeed.toFixed(1)}`);
        return false;
    }
    displayError('speed-error', '');
    return true;
}

function validateReflex(reflex) {
    if (reflex < 10) {
        displayError('reflex-error', 'Reflex phải ít nhất là 10');
        return false;
    }
    displayError('reflex-error', '');
    return true;
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
    isValid = validateHP(hp, total) && isValid;
    isValid = validateSpeed(speed, total) && isValid;
    isValid = validateReflex(reflex) && isValid;

    const sum = hp + power + speed + shielding + recovery + reflex;
    if (Math.abs(sum - total) > 0.1) {
        displayError('total-error', `Tổng các chỉ số (${formatNumber(sum)}) phải bằng Base Stat (${formatNumber(total)})`);
        isValid = false;
    } else {
        displayError('total-error', '');
    }

    return isValid;
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

// Setup Functions
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
}

function setupCharacterInfo() {
    const nevaOrigin = document.getElementById('neva-origin');
    const nevaInspiration = document.getElementById('neva-inspiration');
    
    if (nevaOrigin && nevaInspiration) {
        nevaOrigin.addEventListener('change', function() {
            nevaInspiration.style.display = this.value === 'Character' ? 'block' : 'none';
        });
    }

    const nevaIdInput = document.getElementById('neva-id');
    if (nevaIdInput) {
        nevaIdInput.addEventListener('input', validateNevaId);
    }
}

function setupNevaSkillBuilder() {
    const skillBuilderSection = document.getElementById('skill-builder');
    if (skillBuilderSection) {
        const headerDiv = document.createElement('div');
        headerDiv.className = 'form-header';
        headerDiv.innerHTML = `
            <h3>Xây dựng kỹ năng cho Neva</h3>
            <button type="button" id="neva-skills-help" class="help-button">Help</button>
        `;
        skillBuilderSection.insertBefore(headerDiv, skillBuilderSection.firstChild);

        document.getElementById('neva-skills-help').addEventListener('click', showNevaSkillsHelp);
    }

    const nevaClassSelect = document.getElementById('neva-class');
    const secondAttackElementGroup = document.getElementById('second-attack-element-group');

    if (nevaClassSelect && secondAttackElementGroup) {
        nevaClassSelect.addEventListener('change', function() {
            secondAttackElementGroup.style.display = this.value === 'Attacker' ? 'block' : 'none';
        });
    }

    const addSkillButton = document.getElementById('add-skill');
    if (addSkillButton) {
        addSkillButton.addEventListener('click', addSkill);
    }
}

// Affinity Functions
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

// Stat Functions
function updateStatInputs() {
    const total = parseFloat(document.getElementById('total').value) || 0;
    const statInputs = document.getElementById('stat-inputs');
    const statSummary = document.getElementById('stat-summary');
    const inputValues = document.getElementById('input-values');
    const copyButton = document.getElementById('copy-values');
    const hpInput = document.getElementById('hp');
    const speedInput = document.getElementById('speed');

    if (total > 0) {
        statInputs.style.display = 'block';
        statSummary.style.display = 'flex';
        document.getElementById('remaining-total').textContent = formatNumber(total);
        updateRemaining();

        const requiredHp = formatNumber(total * STAT_CONSTANTS.MIN_HP_RATIO);
        hpInput.placeholder = `Yêu cầu HP thấp nhất = ${requiredHp}`;

        const minSpeed = formatNumber(total * STAT_CONSTANTS.MIN_SPEED_RATIO);
        const maxSpeed = formatNumber(total * STAT_CONSTANTS.MAX_SPEED_RATIO);
        speedInput.placeholder = `Speed nằm trong khoảng: ${minSpeed} - ${maxSpeed}`;

        document.getElementById('power').placeholder = 'Nhập Power cho nhân vật';
        document.getElementById('shielding').placeholder = 'Nhập giá trị ShD cho nhân vật, thường Shielder dùng stat này';
        document.getElementById('recovery').placeholder = 'Nhập giá trị Rec cho nhân vật, thường Healer dùng stat này';
        document.getElementById('reflex').placeholder = 'Nhập Reflex cho nhân vật (tối thiểu 10)';

        if (validateStats()) {
            inputValues.style.display = 'block';
            copyButton.style.display = 'block';
            updateInputValues();
        } else {
            inputValues.style.display = 'none';
            copyButton.style.display = 'none';
        }
    } else {
        statInputs.style.display = 'none';
        statSummary.style.display = 'none';
        inputValues.style.display = 'none';
        copyButton.style.display = 'none';
        
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
    }

    updateCopyButtonVisibility();
}

function updateInputValues() {
    document.getElementById('input-total').textContent = formatNumber(document.getElementById('total').value);
    document.getElementById('input-hp').textContent = formatNumber(document.getElementById('hp').value *10);
    document.getElementById('input-power').textContent = formatNumber(document.getElementById('power').value);
    document.getElementById('input-speed').textContent = formatNumber(document.getElementById('speed').value);
    document.getElementById('input-reflex').textContent = formatNumber(document.getElementById('reflex').value);
    document.getElementById('input-shielding').textContent = formatNumber(document.getElementById('shielding').value);
    document.getElementById('input-recovery').textContent = formatNumber(document.getElementById('recovery').value);

    const total = parseFloat(document.getElementById('total').value) || 0;
    document.getElementById('input-range-limit').textContent = formatNumber(total);
    const hp = parseFloat(document.getElementById('hp').value) || 0;
    document.getElementById('input-healing-limit').textContent = formatNumber(hp * 10 * 0.2);

    updateAffinitySummary();
}

function updateRemaining() {
    const total = parseFloat(document.getElementById('total').value) || 0;
    let used = 0;
    ['hp', 'power', 'speed', 'shielding', 'recovery', 'reflex'].forEach(id => {
        used += parseFloat(document.getElementById(id).value) || 0;
    });
    const remaining = total - used;
    const remainingTotal = document.getElementById('remaining-total');
    if (remainingTotal) {
        remainingTotal.textContent = formatNumber(remaining);
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

// Neva Skill Functions
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
        const tCost = parseFloat(entry.querySelector('input[id^="skill-cost-t-"]').value) || 0;
        const rCost = parseFloat(entry.querySelector('input[id^="skill-cost-r-"]').value) || 0;
        totalCost += tCost + rCost;
    });

    const totalCostElement = document.querySelector('#total-skill-cost span');
    if (totalCostElement) {
        totalCostElement.textContent = totalCost.toFixed(1);
        totalCostElement.style.color = totalCost > 8 ? 'red' : '';
    }
}

// Help Functions
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
        <span style="color: #34495e; padding-left: 15px;">Giá trị affinity của 1 nguyên tố càng to, nhân vật càng yếu với nguyên tố đó.</span></p>

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
    modal.className = 'modal show';
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

// Copy Functions
function copyOperatorInfo() {
    if (!validateRequiredFields('operator-form')) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc cho Operator');
        return;
    }

    let info = getOperatorInfo();
    copyToClipboard(info, 'Đã sao chép thông tin Operator thành công!', 'operator-info-success-message');
}

function copyNevaInfo() {
    if (!validateRequiredFields('neva-form')) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc cho Neva');
        return;
    }

    let info = getNevaInfo();
    copyToClipboard(info, 'Đã sao chép thông tin Neva thành công!', 'neva-info-success-message');
}

function copyAllProfileInfo() {
    let allInfo = "";
    let validSections = 0;

    // Get Operator Info
    if (isOperatorInfoValid()) {
        allInfo += getOperatorInfo() + "\n\n";
        validSections++;
    }

    // Get Neva Info
    if (isNevaInfoValid()) {
        allInfo += getNevaInfo() + "\n\n";
        validSections++;
    }

    // Get Stats Info
    if (isStatsValid()) {
        allInfo += getStatsInfo() + "\n\n";
        validSections++;
    }

    // Get Neva Skills
    if (isNevaSkillsValid()) {
        allInfo += getNevaSkillsInfoFormatted() + "\n\n";
        validSections++;
    }

    if (validSections > 0) {
        copyToClipboard(allInfo.trim(), `Đã sao chép ${validSections} phần thông tin hợp lệ thành công!`, 'all-info-success-message');
    } else {
        alert('Không có thông tin hợp lệ để copy.');
    }
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
            alert(successMessage);
            setTimeout(() => {
                if (successElement.parentNode) {
                    successElement.parentNode.removeChild(successElement);
                }
            }, 5000);
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Có lỗi xảy ra khi sao chép thông tin. Vui lòng thử lại.');
        });
}

// Get Info Functions
function getOperatorInfo() {
    let info = "Thông tin Operator:\n";
    const fields = ['name', 'age', 'gender', 'background', 'personality', 'additional-info'];
    const labels = ['Tên Operator', 'Tuổi', 'Giới tính Operator', 'Background Operator', 'Tính cách Operator', 'Thông tin thêm'];
    
    fields.forEach((field, index) => {
        const value = document.getElementById(`operator-${field}`).value;
        if (value) info += `${labels[index]}: ${value}\n`;
    });
    
    return info;
}

function getNevaInfo() {
    let info = "Thông tin Neva:\n";
    const fields = ['id', 'name', 'gender', 'origin', 'inspiration-text', 'personality', 'background'];
    const labels = ['ID Neva', 'Tên Neva', 'Giới tính Neva', 'Nguồn gốc thiết kế', 'Lấy ý tưởng từ', 'Tính cách Neva', 'Background Neva'];
    
    fields.forEach((field, index) => {
        const value = document.getElementById(`neva-${field}`).value;
        if (value) {
            if (field === 'origin') {
                info += `${labels[index]}: ${value}\n`;
                if (value === 'Character') {
                    const inspiration = document.getElementById('neva-inspiration-text').value;
                    if (inspiration) info += `Lấy ý tưởng từ: ${inspiration}\n`;
                }
            } else if (field !== 'inspiration-text') {
                info += `${labels[index]}: ${value}\n`;
            }
        }
    });
    
    return info;
}

function getStatsInfo() {
    const total = document.getElementById('total').value;
    const hp = document.getElementById('hp').value;
    const power = document.getElementById('power').value;
    const speed = document.getElementById('speed').value;
    const shielding = document.getElementById('shielding').value;
    const recovery = document.getElementById('recovery').value;
    const reflex = document.getElementById('reflex').value;

    let info = "Thông tin chỉ số:\n";
    info += `Base stat: ${total}\n`;
    info += `HP: ${hp}*10 = ${hp * 10}\n`;
    info += `Pow: ${power}\n`;
    info += `Spd: ${speed}\n`;
    info += `Shd: ${shielding}\n`;
    info += `Rec: ${recovery}\n`;
    info += `Ref: ${reflex}\n`;
    info += `Phạm vi dùng skill và tấn công tối đa (Range Limit): ${total} arg\n`;
    info += `Giới hạn healing mỗi turn (Healing Limit): ${hp * 10 * 0.2} HP / turn\n\n`;

    info += "Elemental Affinity:\n";
    elements.forEach(element => {
        const value = document.getElementById(`${element}-affinity`).value;
        info += `${element.charAt(0).toUpperCase() + element.slice(1)} Affinity: ${value}\n`;
    });

    return info;
}

function getNevaSkillsInfo() {
    const nevaClass = document.getElementById('neva-class').value;
    const normalAttackElement = document.getElementById('normal-attack-element').value;
    const secondAttackElement = document.getElementById('second-attack-element').value;

    let info = "Thông tin kỹ năng Neva:\n";
    info += `Class: ${nevaClass}\n`;
    info += `Hệ đòn đánh thường: ${normalAttackElement}\n`;
    if (nevaClass === 'Attacker' && secondAttackElement) {
        info += `Hệ đòn đánh thường thứ 2: ${secondAttackElement}\n`;
    }

    const skillEntries = document.querySelectorAll('.skill-entry');
    skillEntries.forEach((entry, index) => {
        const skillName = entry.querySelector(`#skill-name-${index + 1}`).value || '';
        const skillType = entry.querySelector(`#skill-type-${index + 1}`).value;
        const skillCostT = entry.querySelector(`#skill-cost-t-${index + 1}`).value;
        const skillCostR = entry.querySelector(`#skill-cost-r-${index + 1}`).value;
        const skillDescription = entry.querySelector(`#skill-description-${index + 1}`).value;

        info += `\nSkill ${index + 1}${skillName ? ` - ${skillName}` : ''}:\n`;
        info += `Dạng: ${skillType}\n`;
        
        if (skillType === 'Active') {
            const cooldown = entry.querySelector(`#skill-cooldown-${index + 1}`).value;
            info += `Cooldown: ${cooldown} turn\n`;
        } else if (skillType === 'Buff' || skillType === 'Auto-active') {
            const duration = entry.querySelector(`#skill-duration-${index + 1}`).value;
            const cooldown = entry.querySelector(`#skill-cooldown-${index + 1}`).value;
            info += `Max Duration: ${duration} turn\n`;
            info += `Cooldown: ${cooldown} turn\n`;
        }
        
        info += `Cost: T${skillCostT}R${skillCostR}\n`;
        info += `Mô tả: ${skillDescription}\n`;
    });

    return info;
}

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");
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
            element.addEventListener('input', updateStatInputs);
        }
    });

    const copyValuesButton = document.getElementById('copy-values');
    if (copyValuesButton) {
        copyValuesButton.addEventListener('click', copyValues);
    }

    elements.forEach(element => {
        const input = document.getElementById(`${element}-affinity`);
        if (input) {
            input.addEventListener('input', () => {
                updateAffinityDescription(element, parseFloat(input.value) || 0);
                updateAllAffinities();
            });
        }
    });

    const copyOperatorInfoButton = document.getElementById('copy-operator-info');
    if (copyOperatorInfoButton) {
        copyOperatorInfoButton.addEventListener('click', copyOperatorInfo);
    }

    const copyNevaInfoButton = document.getElementById('copy-neva-info');
    if (copyNevaInfoButton) {
        copyNevaInfoButton.addEventListener('click', copyNevaInfo);
    }

    const copyNevaSkillsButton = document.getElementById('copy-neva-skills');
    if (copyNevaSkillsButton) {
        copyNevaSkillsButton.addEventListener('click', copyNevaSkills);
    }

    const copyAllInfoButton = document.getElementById('copy-all-profile-info');
    if (copyAllInfoButton) {
        copyAllInfoButton.addEventListener('click', copyAllProfileInfo);
    }

    // Ẩn các phần kết quả ban đầu
    document.getElementById('stat-inputs').style.display = 'none';
    document.getElementById('stat-summary').style.display = 'none';
    document.getElementById('input-values').style.display = 'none';
    document.getElementById('copy-values').style.display = 'none';
});

// Additional utility functions
function isOperatorInfoValid() {
    return validateRequiredFields('operator-form');
}

function isNevaInfoValid() {
    return validateRequiredFields('neva-form');
}

function isStatsValid() {
    return validateStats();
}

function isNevaSkillsValid() {
    const nevaClass = document.getElementById('neva-class').value;
    const normalAttackElement = document.getElementById('normal-attack-element').value;
    
    if (!nevaClass || !normalAttackElement) {
        return false;
    }

    const skillEntries = document.querySelectorAll('.skill-entry');
    let totalCost = 0;
    let isValid = true;

    skillEntries.forEach((entry, index) => {
        const skillType = entry.querySelector(`#skill-type-${index + 1}`).value;
        const skillCostT = parseFloat(entry.querySelector(`#skill-cost-t-${index + 1}`).value) || 0;
        const skillCostR = parseFloat(entry.querySelector(`#skill-cost-r-${index + 1}`).value) || 0;
        const skillDescription = entry.querySelector(`#skill-description-${index + 1}`).value;

        if (!skillType || !skillDescription || (skillCostT + skillCostR === 0)) {
            isValid = false;
        }

        totalCost += skillCostT + skillCostR;
    });

    return isValid && totalCost <= 8;
}

function copyValues() {
    const inputValues = document.getElementById('input-values');
    const allLines = inputValues.innerText.split('\n');
    
    const filteredLines = allLines.filter(line => line.trim() !== '');
    const affinityIndex = filteredLines.findIndex(line => line.includes('Elemental Affinity'));
    
    let result = filteredLines.slice(0, affinityIndex).join('\n');
    result += '\n\n' + filteredLines.slice(affinityIndex).join('\n');

    copyToClipboard(result, 'Đã sao chép thông tin chỉ số thành công!', 'success-message');
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
    let totalSkillCost = 0;

    skillEntries.forEach((entry, index) => {
        const skillName = entry.querySelector(`#skill-name-${index + 1}`)?.value || '';
        const skillType = entry.querySelector(`#skill-type-${index + 1}`)?.value;
        const skillCostT = parseFloat(entry.querySelector(`#skill-cost-t-${index + 1}`)?.value) || 0;
        const skillCostR = parseFloat(entry.querySelector(`#skill-cost-r-${index + 1}`)?.value) || 0;
        const skillDescription = entry.querySelector(`#skill-description-${index + 1}`)?.value;

        if (!skillType || isNaN(skillCostT) || isNaN(skillCostR) || !skillDescription) {
            isValid = false;
            return;
        }

        const skillCost = skillCostT + skillCostR;
        totalSkillCost += skillCost;

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
        
        skillsInfo += `Cost: ${skillCost.toFixed(1)} (T${skillCostT.toFixed(1)}R${skillCostR.toFixed(1)})\n`;
        skillsInfo += `Mô tả: ${skillDescription}\n`;
    });

    if (!isValid) {
        alert('Vui lòng điền đầy đủ thông tin cho tất cả các skill (trừ tên skill).');
        return;
    }

    if (totalSkillCost > 8) {
        alert('Tổng Skill Cost vượt quá giới hạn cho phép (8). Vui lòng điều chỉnh lại.');
        return;
    }

    skillsInfo += `\nTổng Skill Cost: ${totalSkillCost.toFixed(1)}\n`;

    copyToClipboard(skillsInfo, 'Đã sao chép thông tin kỹ năng Neva thành công!', 'neva-skills-success-message');
}

function getNevaSkillsInfoFormatted() {
    const nevaClass = document.getElementById('neva-class').value;
    const normalAttackElement = document.getElementById('normal-attack-element').value;
    const secondAttackElement = document.getElementById('second-attack-element').value;

    let info = "Thông tin kỹ năng Neva:\n";
    info += `Class: ${nevaClass}\n`;
    info += `Hệ đòn đánh thường: ${normalAttackElement}\n`;
    if (nevaClass === 'Attacker' && secondAttackElement) {
        info += `Hệ đòn đánh thường thứ 2: ${secondAttackElement}\n`;
    }
    info += '\nKỹ năng:\n';

    const skillEntries = document.querySelectorAll('.skill-entry');
    let totalSkillCost = 0;

    skillEntries.forEach((entry, index) => {
        const skillName = entry.querySelector(`#skill-name-${index + 1}`).value || '';
        const skillType = entry.querySelector(`#skill-type-${index + 1}`).value;
        const skillCostT = parseFloat(entry.querySelector(`#skill-cost-t-${index + 1}`).value) || 0;
        const skillCostR = parseFloat(entry.querySelector(`#skill-cost-r-${index + 1}`).value) || 0;
        const skillDescription = entry.querySelector(`#skill-description-${index + 1}`).value;

        const skillCost = skillCostT + skillCostR;
        totalSkillCost += skillCost;

        info += `\nSkill ${index + 1}${skillName ? ` - ${skillName}` : ''}:\n`;
        info += `Dạng: ${skillType}\n`;
        
        if (skillType === 'Active') {
            const cooldown = entry.querySelector(`#skill-cooldown-${index + 1}`).value;
            info += `Cooldown: ${cooldown} turn\n`;
        } else if (skillType === 'Buff' || skillType === 'Auto-active') {
            const duration = entry.querySelector(`#skill-duration-${index + 1}`).value;
            const cooldown = entry.querySelector(`#skill-cooldown-${index + 1}`).value;
            info += `Max Duration: ${duration} turn\n`;
            info += `Cooldown: ${cooldown} turn\n`;
        }
        
        info += `Cost: ${skillCost.toFixed(1)} (T${skillCostT.toFixed(1)}R${skillCostR.toFixed(1)})\n`;
        info += `Mô tả: ${skillDescription}\n`;
    });

    info += `\nTổng Skill Cost: ${totalSkillCost.toFixed(1)}\n`;

    return info;
}

function copyAllProfileInfo() {
    let allInfo = "";
    let validSections = 0;

    // Get Operator Info
    if (isOperatorInfoValid()) {
        allInfo += getOperatorInfo() + "\n\n";
        validSections++;
    }

    // Get Neva Info
    if (isNevaInfoValid()) {
        allInfo += getNevaInfo() + "\n\n";
        validSections++;
    }

    // Get Stats Info
    if (isStatsValid()) {
        allInfo += getStatsInfo() + "\n\n";
        validSections++;
    }

    // Get Neva Skills
    if (isNevaSkillsValid()) {
        allInfo += getNevaSkillsInfoFormatted() + "\n\n";
        validSections++;
    }

    if (validSections > 0) {
        copyToClipboard(allInfo.trim(), `Đã sao chép ${validSections} phần thông tin hợp lệ thành công!`, 'all-info-success-message');
    } else {
        alert('Không có thông tin hợp lệ để copy.');
    }
}