document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    setupStatCalcForm();
    setupDamageDealtForm();
    setupDamageReceivedForm();
});

function setupEventListeners() {
    document.querySelectorAll('.section-title').forEach(title => {
        title.addEventListener('click', function() {
            const sectionId = this.getAttribute('aria-controls');
            toggleSection(sectionId);
        });
    });
}

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const isExpanded = section.style.display !== 'none';
        section.style.display = isExpanded ? 'none' : 'block';
        const title = document.querySelector(`[aria-controls="${sectionId}"]`);
        if (title) {
            title.setAttribute('aria-expanded', !isExpanded);
            const icon = title.querySelector('.toggle-icon');
            if (icon) {
                icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        }
        
        // Hiển thị hoặc ẩn kết quả tương ứng
        const resultId = getResultId(sectionId);
        const resultElement = document.getElementById(resultId);
        if (resultElement) {
            resultElement.style.display = isExpanded ? 'none' : 'block';
        }
        
        // Tính toán kết quả khi mở phần
        if (!isExpanded) {
            switch (sectionId) {
                case 'stat-calc':
                    calculateStats();
                    break;
                case 'damage-dealt':
                    calculateDamageDealt();
                    break;
                case 'damage-received':
                    calculateDamageReceived();
                    break;
            }
        }
        
        console.log(`Toggled section ${sectionId}. New display: ${section.style.display}`);
    } else {
        console.error(`Section with id ${sectionId} not found`);
    }
}

function getResultId(sectionId) {
    switch (sectionId) {
        case 'stat-calc':
            return 'stat-calc-result';
        case 'damage-dealt':
            return 'damage-dealt-result';
        case 'damage-received':
            return 'calculation-result';
        default:
            return '';
    }
}

function setupStatCalcForm() {
    const form = document.getElementById('stat-calc-form');
    if (!form) return;

    form.innerHTML = `
        <div class="form-header">
            <h3>Tính toán chỉ số</h3>
            <button type="button" id="stat-calc-help" class="help-button">Help</button>
        </div>
        
        <div class="form-group">
            <label for="base-stat-type">Loại Base stat:</label>
            <select id="base-stat-type" required>
                <option value="">Chọn loại stat</option>
                <option value="HP">HP</option>
                <option value="POW">Power</option>
                <option value="SPD">Speed</option>
                <option value="SHD">Shielding</option>
                <option value="REC">Recovery</option>
				<option value="REF">Reflex</option>
                <option value="OTHER">Stat khác</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="player-class">Class:</label>
            <select id="player-class" required>
                <option value="">Chọn class</option>
                <option value="Attacker">Attacker</option>
                <option value="Tanker">Tanker</option>
                <option value="Healer">Healer</option>
                <option value="Debuffer">Debuffer</option>
                <option value="Speedster">Speedster</option>
                <option value="Scouter">Scouter</option>
                <option value="Supporter">Supporter</option>
            </select>
        </div>

        <div class="form-group">
            <label for="base-stat">Base Stat:</label>
            <input type="number" id="base-stat" required placeholder="Nhập chỉ số cơ bản">
        </div>
        
        <div class="form-group">
            <label for="extra-boost">Tăng giới hạn boost (%):</label>
            <input type="number" id="extra-boost" min="0" max="50" value="0" placeholder="Nhập % tăng giới hạn (0-50)">
        </div>
        
        <div class="form-group">
            <label for="buff-count">Số lượng buff:</label>
            <input type="number" id="buff-count" value="0" min="0" placeholder="Số buff">
        </div>
        
        <div id="buff-inputs"></div>
        
        <div class="form-group">
            <label for="debuff-count">Số lượng debuff:</label>
            <input type="number" id="debuff-count" value="0" min="0" placeholder="Số debuff">
        </div>
        
        <div id="debuff-inputs"></div>
    `;

    form.addEventListener('input', calculateStats);
    document.getElementById('buff-count').addEventListener('input', e => updateStatBuffDebuffInputs(e.target, 'buff'));
    document.getElementById('debuff-count').addEventListener('input', e => updateStatBuffDebuffInputs(e.target, 'debuff'));
    document.getElementById('base-stat-type').addEventListener('change', calculateStats);
    document.getElementById('player-class').addEventListener('change', calculateStats);
    document.getElementById('extra-boost').addEventListener('input', calculateStats);
    document.getElementById('stat-calc-help').addEventListener('click', showStatCalcHelp);
}

function setupDamageDealtForm() {
    const form = document.getElementById('damage-dealt-form');
    if (!form) return;

    form.innerHTML = `
        <div class="form-header">
            <h3>Tính toán sát thương</h3>
            <button type="button" id="damage-dealt-help" class="help-button">Help</button>
        </div>
        <div class="form-group">
            <label for="attack-count">Số lượng đòn tấn công:</label>
            <input type="number" id="attack-count" min="1" value="1" required>
        </div>
        
        <div id="attacks-container"></div>
    `;

    form.addEventListener('input', calculateDamageDealt);
    document.getElementById('attack-count').addEventListener('input', updateAttackInputs);
    document.getElementById('damage-dealt-help').addEventListener('click', showDamageDealtHelp);
    updateAttackInputs();
    // Ẩn kết quả ban đầu
    document.getElementById('damage-dealt-result').style.display = 'none';
}

function showDamageDealtHelp() {
    const helpContent = `
        <p><strong style="color: #e74c3c;">Số lượng đòn tấn công:</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Nhập số lượng đòn tấn công bạn muốn tính toán.</span></p><br>

        <p><strong style="color: #2980b9;">Sát thương (Pow):</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Nhập chỉ số sát thương cơ bản của đòn tấn công.</span></p><br>

        <p><strong style="color: #27ae60;">Số lượng buff sát thương:</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Nhập số lượng buff tăng sát thương cho đòn tấn công.</span></p><br>

        <p><strong style="color: #8e44ad;">Số lượng debuff giảm sát thương:</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Nhập số lượng debuff giảm sát thương cho đòn tấn công.</span></p><br>
		
		<p><strong style="color: #16a085;">Giá trị buff/debuff:</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Nhập % tăng (buff) hoặc giảm (debuff) cho sát thương của bạn.</span></p><br>

        <p><strong style="color: #d35400;">True Damage:</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Đánh dấu nếu đòn tấn công gây sát thương thật (Bỏ qua hiệu ứng giảm sát thương theo %).</span></p><br>

        <p><strong style="color: #16a085;">Piercing:</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Đánh dấu nếu đòn tấn công có khả năng xuyên giáp (Bỏ qua hiệu ứng có khả năng chặn một lượng sát thương cố định).</span></p><br>

        <p style="background-color: #f1c40f; color: #000000; padding: 10px; border-radius: 5px;">Hệ thống sẽ tự động tính toán sát thương cuối cùng dựa trên các thông tin bạn nhập, có tính đến các buff, debuff và hiệu ứng đặc biệt.</p>
    `;

    showModal('Hướng dẫn tính toán sát thương', helpContent);
}

function updateStatBuffDebuffInputs(countInput, type) {
    const count = parseInt(countInput.value) || 0;
    const container = document.getElementById(`${type}-inputs`);
    container.innerHTML = Array.from({length: count}, (_, i) => createBuffDebuffInput(type, i)).join('');

    container.querySelectorAll(`.${type}-input`).forEach(input => input.addEventListener('input', calculateStats));
    calculateStats();
}

function createBuffDebuffInput(type, index) {
    const label = `${type.charAt(0).toUpperCase() + type.slice(1)} chỉ số ${index + 1}`;
    return `
        <div class="form-group">
            <label for="${type}-${index}">${label} (%):</label>
            <input type="number" id="${type}-${index}" class="${type}-input" min="0" max="100" required placeholder="Nhập giá trị của ${type}">
        </div>
    `;
}

function updateAttackInputs() {
    const attackCount = parseInt(document.getElementById('attack-count').value) || 1;
    const attacksContainer = document.getElementById('attacks-container');
    attacksContainer.innerHTML = Array.from({length: attackCount}, (_, i) => createAttackInput(i)).join('');

    ['buff', 'debuff'].forEach(type => {
        document.querySelectorAll(`.${type}-count-input`).forEach(input => {
            input.addEventListener('input', e => updateBuffDebuffInputs(e.target, type, 'attack'));
        });
    });

    document.querySelectorAll('.copy-previous-button').forEach(button => {
        button.addEventListener('click', copyPreviousAttack);
    });

    calculateDamageDealt();
}

function createAttackInput(index) {
    const copyButton = index > 0 ? `<button type="button" class="copy-previous-button" data-attack-index="${index}">Sao chép từ đòn trước</button>` : '';
    return `
        <div class="attack-input" id="attack-${index}">
            <h3>Đòn tấn công ${index + 1}</h3>
            ${copyButton}
            <label for="power-${index}">Sát thương (Pow):</label>
            <input type="number" id="power-${index}" class="power-input" min="0" required placeholder="Nhập chỉ số Pow sau khi tính qua buff và debuff.">
            
            <label for="buff-count-${index}">Số lượng buff sát thương:</label>
            <input type="number" id="buff-count-${index}" class="buff-count-input" value="0" min="0">
            <div id="buff-inputs-${index}" class="buff-inputs"></div>
            
            <label for="debuff-count-${index}">Số lượng debuff giảm sát thương:</label>
            <input type="number" id="debuff-count-${index}" class="debuff-count-input" value="0" min="0">
            <div id="debuff-inputs-${index}" class="debuff-inputs"></div>
            
            <label>
                <input type="checkbox" id="true-damage-${index}" class="effect-checkbox"> True Damage
            </label>
            <label>
                <input type="checkbox" id="piercing-${index}" class="effect-checkbox"> Piercing
            </label>
        </div>
    `;
}

function updateBuffDebuffInputs(countInput, type, context) {
    const count = parseInt(countInput.value) || 0;
    const container = countInput.nextElementSibling;
    container.innerHTML = Array.from({length: count}, (_, i) => createBuffDebuffInput(type, i, context)).join('');

    container.querySelectorAll(`.${type}-input`).forEach(input => {
        input.addEventListener('input', () => context === 'attack' && calculateDamageDealt());
    });

    if (context === 'attack') calculateDamageDealt();
}

function copyPreviousAttack(event) {
    const currentIndex = parseInt(event.target.getAttribute('data-attack-index'));
    const previousIndex = currentIndex - 1;

    ['power', 'buff-count', 'debuff-count', 'true-damage', 'piercing'].forEach(field => {
        const currentElement = document.getElementById(`${field}-${currentIndex}`);
        const previousElement = document.getElementById(`${field}-${previousIndex}`);
        if (currentElement.type === 'checkbox') {
            currentElement.checked = previousElement.checked;
        } else {
            currentElement.value = previousElement.value;
        }
    });

    ['buff', 'debuff'].forEach(type => {
        updateBuffDebuffInputs(document.getElementById(`${type}-count-${currentIndex}`), type, 'attack');
        const count = parseInt(document.getElementById(`${type}-count-${previousIndex}`).value) || 0;
        for (let i = 0; i < count; i++) {
            const prevValue = document.getElementById(`${type}-${type}-count-${previousIndex}-${i}`).value;
            document.getElementById(`${type}-${type}-count-${currentIndex}-${i}`).value = prevValue;
        }
    });

    calculateDamageDealt();
}

function calculateStats() {
    const baseStatType = document.getElementById('base-stat-type').value;
    const playerClass = document.getElementById('player-class').value;
    const baseStat = parseFloat(document.getElementById('base-stat').value) || 0;
    let extraBoost = parseFloat(document.getElementById('extra-boost').value) || 0;
    
    // Giới hạn extraBoost tối đa là 50%
    extraBoost = Math.min(extraBoost, 50);
    
    const { total: totalBuff, details: buffDetails } = calculateBuffDebuff('#buff-inputs .buff-input', 'Buff chỉ số');
    const { total: totalDebuff, details: debuffDetails } = calculateBuffDebuff('#debuff-inputs .debuff-input', 'Debuff chỉ số', true);

    if (!baseStatType || !playerClass || baseStat === 0) {
        document.getElementById('stat-calc-result').style.display = 'none';
        return;
    }

    let finalStat = baseStat * (1 + totalBuff / 100) * totalDebuff;

    // Áp dụng giới hạn boost stat dựa trên class và loại stat
    let boostLimit = (CLASS_BOOST_LIMITS[playerClass] && CLASS_BOOST_LIMITS[playerClass][baseStatType]) || 1.5;
    
    // Áp dụng extra boost
    boostLimit += extraBoost / 100;

    // Xử lý trường hợp đặc biệt cho Scouter
    if (playerClass === 'Scouter') {
        boostLimit = 2 + extraBoost / 100; // Giới hạn boost là 100% (2 lần base stat) + extra boost
    }

    const maxStat = baseStat * boostLimit;
    finalStat = Math.min(finalStat, maxStat);

    const resultElement = document.getElementById('stat-calc-result');
    resultElement.innerHTML = `
        <p>Loại Base Stat: ${baseStatType}</p>
        <p>Class: ${playerClass}</p>
        <p>Base Stat: ${baseStat}</p>
        <p>Tăng giới hạn boost: ${extraBoost}%</p>
        <p>Tổng buff: ${buffDetails.length > 0 ? buffDetails.join(' + ') : '0%'} = <span style="color: red;">${totalBuff}%</span></p>
        <p>Tổng debuff: 1 - ${debuffDetails.length > 0 ? debuffDetails.join(' * ') : '100'}% / 100 = <span style="color: red;">${((1 - totalDebuff) * 100).toFixed(2)}%</span></p>
        <p>Giới hạn boost: ${(boostLimit * 100).toFixed(2)}% của Base Stat</p>
        <p><strong>Stat cuối cùng: ${finalStat.toFixed(2)}</strong></p>
        ${finalStat >= maxStat ? '<p style="color: orange;">Đã đạt giới hạn boost cho class này!</p>' : ''}
    `;
    resultElement.style.display = 'block';
}

function calculateBuffDebuff(selector, label, isDebuff = false) {
    const inputs = document.querySelectorAll(selector);
    let total = isDebuff ? 1 : 0;
    const details = [];
    inputs.forEach((input, index) => {
        const value = parseFloat(input.value) || 0;
        if (value !== 0) {
            if (isDebuff) {
                total *= (100 - value) / 100;
            } else {
                total += value;
            }
            details.push(`${label} ${index + 1}: ${value}%`);
        }
    });
    return { total: isDebuff ? total : total, details };
}

function calculateDamageDealt() {
    const attackCount = parseInt(document.getElementById('attack-count').value) || 1;
    let damageDetails = [];
    let attackSummary = [];

    for (let i = 0; i < attackCount; i++) {
        const { damage, effects, details } = calculateSingleAttack(i);
        attackSummary.push(`Đòn tấn công ${i + 1}: ${damage.toFixed(2)}${effects.length > 0 ? `, có hiệu ứng ${effects.join(', ')}` : ''}`);
        damageDetails.push(details);
    }

    const resultElement = document.getElementById('damage-dealt-result');
    resultElement.innerHTML = `
        <h3>Tóm tắt sát thương:</h3>
        <ul>${attackSummary.map(summary => `<li>${summary}</li>`).join('')}</ul>
        <h3>Chi tiết tính toán:</h3>
        ${damageDetails.join('<hr>')}
    `;
    resultElement.style.display = document.getElementById('damage-dealt').style.display !== 'none' ? 'block' : 'none';
}

function calculateSingleAttack(index) {
    const power = parseFloat(document.getElementById(`power-${index}`).value) || 0;
    const { total: totalBuff } = calculateBuffDebuff(`#buff-inputs-${index} .buff-input`);
    const { total: totalDebuff } = calculateBuffDebuff(`#debuff-inputs-${index} .debuff-input`, '', true);

    const damage = power * (1 + totalBuff / 100) * totalDebuff;

    const trueDamage = document.getElementById(`true-damage-${index}`).checked;
    const piercing = document.getElementById(`piercing-${index}`).checked;

    const effects = [trueDamage && 'true damage', piercing && 'piercing'].filter(Boolean);

    const details = `
        <h4>Đòn tấn công ${index + 1}:</h4>
        <p>Sát thương cơ bản: ${power}</p>
        <p>Tổng buff sát thương: ${totalBuff}% = <span style="color: red;">${totalBuff}%</span></p>
        <p>Tổng debuff giảm sát thương: 1 - ${((1 - totalDebuff) * 100).toFixed(2)}% / 100 = <span style="color: red;">${((1 - totalDebuff) * 100).toFixed(2)}%</span></p>
        <p>Sát thương cuối cùng: <strong>${damage.toFixed(2)}</strong></p>
        <p>Hiệu ứng: ${effects.length > 0 ? effects.join(', ') : 'Không có'}</p>
    `;

    return { damage, effects, details };
}

function setupDamageReceivedForm() {
    if (typeof window.initDamageReceivedForm === 'function') {
        window.initDamageReceivedForm();
    } else {
        console.error('initDamageReceivedForm function not found. Make sure damage-received-script.js is loaded correctly.');
    }
}

const CLASS_BOOST_LIMITS = {
    Attacker: { HP: 1.5, POW: 2, SHD: 1.5, SPD: 1.5, REC: 1.5, REF: 1.5 },
    Tanker: { HP: 2, POW: 1.5, SHD: 2, SPD: 1.5, REC: 1.5, REF: 1.5 },
    Healer: { HP: 1.5, POW: 1.5, SHD: 1.5, SPD: 1.5, REC: 2, REF: 1.5 },
    Debuffer: { HP: 1.5, POW: 1.5, SHD: 1.5, SPD: 1.5, REC: 1.5, REF: 1.5 },
    Speedster: { HP: 1.5, POW: 1.5, SHD: 1.5, SPD: 2, REC: 1.5, REF: 1.5 },
    Scouter: { HP: 1.5, POW: 1.5, SHD: 1.5, SPD: 1.5, REC: 1.5, REF: 2 },
    Supporter: { HP: 1.5, POW: 1.5, SHD: 1.5, SPD: 1.5, REC: 1.5, REF: 1.5 }
};

function showStatCalcHelp() {
    const helpContent = `
        <p><strong style="color: #e74c3c;">Loại Base stat:</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Chọn loại chỉ số bạn muốn tính toán (HP, Power, Speed, Shielding, Recovery hoặc các chỉ số khác).</span></p><br>

        <p><strong style="color: #2980b9;">Class:</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Chọn class của nhân vật. Mỗi class có giới hạn boost khác nhau cho từng loại chỉ số.</span></p><br>

        <p><strong style="color: #27ae60;">Base Stat:</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Nhập giá trị chỉ số cơ bản của nhân vật.</span></p><br>

        <p><strong style="color: #8e44ad;">Tăng giới hạn boost:</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Nhập % tăng thêm cho giới hạn boost (tối đa 50%).</span></p><br>

        <p><strong style="color: #d35400;">Số lượng buff/debuff:</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Nhập số lượng buff hoặc debuff ảnh hưởng đến chỉ số.</span></p><br>

        <p><strong style="color: #16a085;">Giá trị buff/debuff:</strong><br>
        <span style="color: #34495e; padding-left: 15px;">Nhập % tăng (buff) hoặc giảm (debuff) cho mỗi hiệu ứng.</span></p><br>

        <p style="background-color: #f1c40f; color: #000000; padding: 10px; border-radius: 5px;">Hệ thống sẽ tự động tính toán chỉ số cuối cùng dựa trên các thông tin bạn nhập, có tính đến giới hạn boost của từng class.</p>
    `;

    showModal('Hướng dẫn tính toán chỉ số', helpContent);
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