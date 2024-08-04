function initDamageReceivedForm() {
    const form = document.getElementById('damage-received-form');
    if (!form) return;

    form.innerHTML = `
        <div class="form-header">
            <h3>Tính toán sát thương nhận vào</h3>
            <button type="button" id="damage-received-help" class="help-button">Help</button>
        </div>

        <h3>Thông tin người tấn công</h3>
        <label for="attacker-damage">Sát thương người tấn công:</label>
        <input type="number" id="attacker-damage" required min="0" placeholder="Nhập sát thương của người tấn công">
        
        <div class="checkbox-group">
            <label><input type="checkbox" id="effect-cdd"> CDD</label>
            <label><input type="checkbox" id="effect-true-damage"> True Damage</label>
            <label><input type="checkbox" id="effect-piercing"> Piercing Damage</label>
        </div>
        
        <label for="attack-element">Hệ của đòn tấn công:</label>
        <select id="attack-element" required>
            <option value="">Chọn hệ</option>
            <option value="Force">Force</option>
            <option value="Flame">Flame</option>
            <option value="Aqua">Aqua</option>
            <option value="Gale">Gale</option>
            <option value="Terra">Terra</option>
            <option value="Holy">Holy</option>
            <option value="Shadow">Shadow</option>
        </select>

        <h3>Thông tin người nhận sát thương</h3>
        <p>Người nhận sát thương có hiệu ứng:</p>
        <div class="checkbox-group">
            <label><input type="checkbox" id="negate-cdd"> Negate CDD</label>
            <label><input type="checkbox" id="negate-true-damage"> Negate True Damage</label>
            <label><input type="checkbox" id="negate-piercing"> Negate Piercing Damage</label>
        </div>

        <h4>1. Giảm sát thương nhận vào cố định</h4>
        
        <label for="own-attack-count">Số lượng đòn tấn công của bản thân:</label>
        <div class="input-wrapper">
            <input type="number" id="own-attack-count" min="0">
            <span class="input-message" id="own-attack-count-message"></span>
        </div>
        <div id="own-attack-inputs"></div>
        
        <label for="shield-terrain-count">Số lượng vật cản (khiên, fake HP, địa hình):</label>
        <div class="input-wrapper">
            <input type="number" id="shield-terrain-count" min="0">
            <span class="input-message" id="shield-terrain-count-message"></span>
        </div>
        <div id="shield-terrain-inputs"></div>
        
        <label for="reduce-def">Def của bản thân:</label>
        <div class="input-wrapper">
            <input type="number" id="reduce-def" min="0">
            <span class="input-message" id="reduce-def-message"></span>
        </div>

        <h4>2. Giảm sát thương nhận vào theo tỉ lệ</h4>
        <label for="damage-reduction-count">Số lượng giảm sát thương theo tỉ lệ:</label>
        <div class="input-wrapper">
            <input type="number" id="damage-reduction-count" min="0">
            <span class="input-message" id="damage-reduction-count-message"></span>
        </div>
        <div id="damage-reduction-inputs"></div>

        <label for="elemental-affinity" id="elemental-affinity-label">Elemental Affinity:</label>
        <input type="number" id="elemental-affinity" step="0.01" value="1" placeholder="Nhập hệ số Elemental Affinity (mặc định: 1)">
    `;

    form.addEventListener('input', calculateDamageReceived);
    form.addEventListener('change', calculateDamageReceived);

    document.getElementById('own-attack-count').addEventListener('input', updateOwnAttackInputs);
    document.getElementById('shield-terrain-count').addEventListener('input', updateShieldTerrainInputs);
    document.getElementById('damage-reduction-count').addEventListener('input', updateDamageReductionInputs);
    document.getElementById('attack-element').addEventListener('change', updateElementalAffinityLabel);
    document.getElementById('damage-received-help').addEventListener('click', showDamageReceivedHelp);

    updateInputStates();
    updateOwnAttackInputs();
    updateShieldTerrainInputs();
    updateDamageReductionInputs();
    updateElementalAffinityLabel();
    document.getElementById('calculation-result').style.display = 'none';
}

function showDamageReceivedHelp() {
    const helpContent = `
        <div style="background: linear-gradient(45deg, #2c3e50, #34495e); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="text-align: center; margin: 0; color: #ecf0f1;">🛡️ Hướng Dẫn Tính Toán Sát Thương Nhận Vào 🛡️</h3>
        </div>

        <p style="font-size: 18px; color: #2c3e50; text-align: center; margin-bottom: 20px;">
            <strong>Công cụ này giúp bạn tính toán chính xác sát thương nhận vào, xem xét mọi yếu tố từ người tấn công đến khả năng phòng thủ của bạn!</strong>
        </p>

        <h3 style="color: #c0392b; border-bottom: 2px solid #c0392b; padding-bottom: 5px;">🗡️ Thông Tin Người Tấn Công</h3>
        <ul style="list-style-type: none; padding-left: 20px; color: #34495e;">
            <li>🔢 <strong>Sát thương:</strong> Nhập giá trị sát thương gốc của kẻ tấn công.</li>
            <li>🌟 <strong>Hiệu ứng đặc biệt:</strong>
                <ul>
                    <li>🔁 <strong>CDD:</strong> Sát thương duy trì, có thể xuyên qua một số phòng thủ.</li>
                    <li>💯 <strong>True Damage:</strong> Sát thương thật, bỏ qua mọi giảm thiểu % và Elemental Affinity.</li>
                    <li>🎯 <strong>Piercing:</strong> Sát thương xuyên giáp, bỏ qua phòng thủ cố định.</li>
                </ul>
            </li>
            <li>🌈 <strong>Hệ tấn công:</strong> Chọn hệ của đòn tấn công (ảnh hưởng tới Elemental Affinity).</li>
        </ul>

        <h3 style="color: #2980b9; border-bottom: 2px solid #2980b9; padding-bottom: 5px;">🛡️ Thông Tin Người Nhận Sát Thương</h3>
        <ul style="list-style-type: none; padding-left: 20px; color: #34495e;">
            <li>🚫 <strong>Hiệu ứng phòng thủ:</strong> Chọn các hiệu ứng vô hiệu hóa sát thương đặc biệt.</li>
            <li>🛑 <strong>Giảm sát thương cố định:</strong>
                <ul>
                    <li>⚔️ Số đòn tấn công phản lại</li>
                    <li>🏰 Số lượng vật cản (khiên, fake HP, địa hình)</li>
                    <li>🛡️ Chỉ số Def của bạn</li>
                </ul>
            </li>
            <li>📉 <strong>Giảm sát thương theo %:</strong> Nhập số lượng và giá trị % giảm sát thương.</li>
            <li>🔮 <strong>Elemental Affinity:</strong> Hệ số kháng/yếu với hệ tấn công (< 1: kháng, > 1: yếu, < 0: hấp thụ).</li>
        </ul>

        <div style="background-color: #e67e22; color: white; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0; text-align: center; font-weight: bold;">
                ⚠️ Lưu Ý: Hệ thống sẽ tự động tính toán sát thương cuối cùng dựa trên tất cả thông tin bạn cung cấp! ⚠️
            </p>
        </div>
    `;

    showModal('Hướng Dẫn Tính Sát Thương Nhận Vào', helpContent);
}

function updateElementalAffinityLabel() {
    const attackElement = document.getElementById('attack-element').value;
    const label = document.getElementById('elemental-affinity-label');
    const input = document.getElementById('elemental-affinity');
    
    if (attackElement) {
        const elementName = getElementName(attackElement);
        label.textContent = `${elementName} Affinity:`;
        input.placeholder = `Nhập hệ số ${elementName} Affinity (mặc định: 1)`;
    } else {
        label.textContent = 'Elemental Affinity:';
        input.placeholder = 'Nhập hệ số Elemental Affinity (mặc định: 1)';
    }
}

function updateOwnAttackInputs() {
    const count = parseInt(document.getElementById('own-attack-count').value);
    const container = document.getElementById('own-attack-inputs');
    container.innerHTML = '';

    if (isNaN(count) || count <= 0) return;

    for (let i = 0; i < count; i++) {
        const label = i === 0 ? 'Sát thương của đòn tấn công:' : `Giảm sát thương bằng đòn tấn công ${i + 1}:`;
        const placeholder = i === 0 ? 'Nhập sát thương của đòn tấn công' : `Nhập giảm sát thương của đòn ${i + 1}`;
        container.innerHTML += `
            <label for="own-attack-${i}">${label}</label>
            <div class="input-wrapper">
                <input type="number" id="own-attack-${i}" min="0" class="own-attack-input" placeholder="${placeholder}" data-original-placeholder="${placeholder}">
                <span class="input-message" id="own-attack-${i}-message"></span>
            </div>
        `;
    }
    updateInputStates();
    calculateDamageReceived();
}

function updateShieldTerrainInputs() {
    const count = parseInt(document.getElementById('shield-terrain-count').value);
    const container = document.getElementById('shield-terrain-inputs');
    container.innerHTML = '';

    if (isNaN(count) || count <= 0) return;

    for (let i = 0; i < count; i++) {
        const label = i === 0 ? 'Độ bền vật cản 1:' : `Giảm sát thương bằng vật cản ${i + 1}:`;
        const placeholder = i === 0 ? 'Nhập độ bền của vật cản 1' : `Nhập giảm sát thương của vật cản ${i + 1}`;
        container.innerHTML += `
            <label for="shield-terrain-${i}">${label}</label>
            <div class="input-wrapper">
                <input type="number" id="shield-terrain-${i}" min="0" class="shield-terrain-input" placeholder="${placeholder}" data-original-placeholder="${placeholder}">
                <span class="input-message" id="shield-terrain-${i}-message"></span>
            </div>
        `;
    }
    updateInputStates();
    calculateDamageReceived();
}

function updateDamageReductionInputs() {
    const count = parseInt(document.getElementById('damage-reduction-count').value);
    const container = document.getElementById('damage-reduction-inputs');
    container.innerHTML = '';

    if (isNaN(count) || count <= 0) return;

    for (let i = 0; i < count; i++) {
        const placeholder = 'Nhập % giảm sát thương (0-100)';
        container.innerHTML += `
            <label for="damage-reduction-${i}">Giảm sát thương ${i + 1} (%):</label>
            <div class="input-wrapper">
                <input type="number" id="damage-reduction-${i}" min="0" max="100" class="damage-reduction-input" placeholder="${placeholder}" data-original-placeholder="${placeholder}">
                <span class="input-message" id="damage-reduction-${i}-message"></span>
            </div>
        `;
    }
    updateInputStates();
    calculateDamageReceived();
}

function updateInputStates() {
    const isCDD = document.getElementById('effect-cdd').checked;
    const isTrueDamage = document.getElementById('effect-true-damage').checked;
    const isPiercing = document.getElementById('effect-piercing').checked;
    const negateCDD = document.getElementById('negate-cdd').checked;
    const negateTrueDamage = document.getElementById('negate-true-damage').checked;
    const negatePiercing = document.getElementById('negate-piercing').checked;

    const ownAttackCount = document.getElementById('own-attack-count');
    const shieldTerrainCount = document.getElementById('shield-terrain-count');
    const damageReductionCount = document.getElementById('damage-reduction-count');
    const ownAttackInputs = document.querySelectorAll('.own-attack-input');
    const shieldTerrainInputs = document.querySelectorAll('.shield-terrain-input');
    const reduceDef = document.getElementById('reduce-def');
    const damageReductionInputs = document.querySelectorAll('.damage-reduction-input');
    const elementalAffinityInput = document.getElementById('elemental-affinity');

    const effectivePiercing = isPiercing && !negatePiercing;
    const effectiveTrueDamage = isTrueDamage && !negateTrueDamage;

    function updateInputAndMessage(input, messageElement, isDisabled, message) {
        input.disabled = isDisabled;
        input.style.backgroundColor = isDisabled ? '#f0f0f0' : '';
        messageElement.textContent = isDisabled ? message : '';
    }

    updateInputAndMessage(ownAttackCount, document.getElementById('own-attack-count-message'), effectivePiercing, 'Đòn tấn công có piercing damage, phần này bị bỏ qua');
    updateInputAndMessage(shieldTerrainCount, document.getElementById('shield-terrain-count-message'), effectivePiercing, 'Đòn tấn công có hiệu ứng Piercing, phần này bị bỏ qua');
    updateInputAndMessage(damageReductionCount, document.getElementById('damage-reduction-count-message'), effectiveTrueDamage, 'Đòn tấn công có hiệu ứng True Damage, phần này bị bỏ qua');

    const fixedReductionInputs = [...ownAttackInputs, ...shieldTerrainInputs, reduceDef];
    fixedReductionInputs.forEach(input => {
        const messageElement = document.getElementById(`${input.id}-message`);
        updateInputAndMessage(input, messageElement, effectivePiercing, 'Đòn tấn công có hiệu ứng Piercing, phần này bị bỏ qua');
    });

    damageReductionInputs.forEach(input => {
        const messageElement = document.getElementById(`${input.id}-message`);
        updateInputAndMessage(input, messageElement, effectiveTrueDamage, 'Đòn tấn công có hiệu ứng True Damage, phần này bị bỏ qua');
    });

    elementalAffinityInput.disabled = false;
    elementalAffinityInput.style.backgroundColor = '';
    elementalAffinityInput.min = effectiveTrueDamage ? "1" : "-999";
    if (effectiveTrueDamage && parseFloat(elementalAffinityInput.value) < 1) {
        elementalAffinityInput.value = "1";
    }
    elementalAffinityInput.placeholder = effectiveTrueDamage ? 'Tối thiểu là 1 do True Damage' : 'Nhập hệ số Elemental Affinity (mặc định: 1)';
}

function calculateDamageReceived() {
    const attackerDamage = parseFloat(document.getElementById('attacker-damage').value) || 0;
    const attackElement = document.getElementById('attack-element').value;
    
    if (attackerDamage === 0 || !attackElement) {
        updateInputStates();
        return;
    }

    const isCDD = document.getElementById('effect-cdd').checked;
    const isTrueDamage = document.getElementById('effect-true-damage').checked;
    const isPiercing = document.getElementById('effect-piercing').checked;
    const negateCDD = document.getElementById('negate-cdd').checked;
    const negateTrueDamage = document.getElementById('negate-true-damage').checked;
    const negatePiercing = document.getElementById('negate-piercing').checked;

    const effectiveCDD = isCDD && !negateCDD;
    const effectiveTrueDamage = isTrueDamage && !negateTrueDamage;
    const effectivePiercing = isPiercing && !negatePiercing;

    const ownAttackInputs = document.querySelectorAll('.own-attack-input');
    const shieldTerrainInputs = document.querySelectorAll('.shield-terrain-input');
    const reduceDef = parseFloat(document.getElementById('reduce-def').value) || 0;

    let totalOwnAttackReduction = 0;
    let allOwnAttacksLessThanDamage = true;
    ownAttackInputs.forEach(input => {
        const value = parseFloat(input.value) || 0;
        if (value >= attackerDamage) {
            allOwnAttacksLessThanDamage = false;
        }
        totalOwnAttackReduction += value;
    });

    let totalShieldTerrainReduction = 0;
    let allShieldTerrainLessThanDamage = true;
    shieldTerrainInputs.forEach(input => {
        const value = parseFloat(input.value) || 0;
        if (value >= attackerDamage) {
            allShieldTerrainLessThanDamage = false;
        }
        totalShieldTerrainReduction += value;
    });

    const damageReductionInputs = document.querySelectorAll('.damage-reduction-input');
    let A = 1;
    damageReductionInputs.forEach(input => {
        const value = parseFloat(input.value) || 0;
        A *= (1 - value / 100);
    });
    A = 1 - A;
    
    let B = reduceDef;
    if (!effectiveCDD || !allOwnAttacksLessThanDamage) {
        B += totalOwnAttackReduction;
    }
    if (!effectiveCDD || !allShieldTerrainLessThanDamage) {
        B += totalShieldTerrainReduction;
    }
    
    let C = parseFloat(document.getElementById('elemental-affinity').value) || 1;
    const elementName = getElementName(attackElement);

    let finalDamage = attackerDamage;

    if (!effectiveTrueDamage) {
        finalDamage *= (1 - A);
    }

    if (!effectivePiercing) {
        finalDamage -= B;
    }

    finalDamage = Math.max(0, finalDamage);
    finalDamage *= C;

    updateInputStates();
    
    let resultHTML = `
        <h3>Kết quả tính sát thương nhận vào:</h3>
        <p>Sát thương ban đầu (Dmg): ${attackerDamage}</p>
        <p>Hệ của đòn tấn công: <strong>${elementName}</strong></p>
        <p>Hiệu ứng: ${effectiveCDD ? 'CDD, ' : ''}${effectiveTrueDamage ? 'True Damage, ' : ''}${effectivePiercing ? 'Piercing, ' : ''}</p>
        <h4>Các thông số:</h4>
        <p>A: Giảm sát thương nhận vào theo tỉ lệ = ${(A * 100).toFixed(2)}% ${effectiveTrueDamage ? '(Không áp dụng do True Damage)' : ''}</p>
        <p>B: Giảm sát thương nhận vào cố định = ${B} ${effectivePiercing ? '(Không áp dụng do Piercing)' : ''}</p>
        <p>C: ${elementName} Affinity = ${C.toFixed(2)}</p>
        <h4>Công thức tính:</h4>
        <p>Final Dmg = (Dmg ${effectiveTrueDamage ? '' : 'x (1-A)'} ${effectivePiercing ? '' : '- B'}) x C</p>
    `;

    if (C >= 0) {
        resultHTML += `<p><strong>Sát thương cuối cùng nhận vào: <span style="color: #FF0000; font-size: 1.2em;">${finalDamage.toFixed(2)}</span></strong></p>`;
    } else {
        const healingAmount = Math.abs(finalDamage);
        resultHTML += `
            <p><strong>Nhân vật phục hồi: <span style="color: #00AA00; font-size: 1.2em;">${healingAmount.toFixed(2)} HP</span></strong></p>
            <p style="color: #0000FF;"><em>Lưu ý: HP phục hồi vẫn tuân theo healing limit mỗi turn.</em></p>
        `;
    }

    const resultElement = document.getElementById('calculation-result');
    if (resultElement) {
        resultElement.innerHTML = resultHTML;
        resultElement.style.display = 'block';
    }
}

// Đảm bảo rằng hàm có thể được gọi từ bên ngoài
window.initDamageReceivedForm = initDamageReceivedForm;

function getElementName(element) {
    const elementNames = {
        'Force': 'Force',
        'Flame': 'Flame',
        'Aqua': 'Aqua',
        'Gale': 'Gale',
        'Terra': 'Terra',
        'Holy': 'Holy',
        'Shadow': 'Shadow'
    };
    return elementNames[element] || element;
}