function _mul(name_property, list_buff) {
    for (var element of list_buff) {
        if (element[0] === name_property) return element[1]
    }
    return 1
}
function _pro(name_property) {
    if (name_property === 'random') return (Math.random() * 0.3 + 0.85)
    else if (name_property === 'e_arm') return arguments['1']
    else {
        var info = arguments['1']
        return info.get(name_property)
    }
}

function settle_buff(stand_num, info_self) {
    var _mul_dmg = 1,
        _mul_acu = 1,
        _mul_critdmg = 1,
        must_acu = false,
        must_crit = false,
        no_crit = false
    if (is_this(stand_num, 4)) { // python active
        if (Set_Special.get('python_opening') != undefined && Set_Special.get('python_active') > 0) {
            if (Set_Special.get('python_active') === 1) _mul_dmg *= 2
            var num_left = Set_Special.get('python_active') - 1
            Set_Special.set('python_active', num_left)
            changeStatus(stand_num, 'self', 'dmg', '0.3', 5)
            if (num_left === 0) {
                Set_Skill.get(stand_num)[0][1] = 0 // re-attack
            }
        }
    }
    else if (is_this(stand_num, 77) || is_this(stand_num, 85) || is_this(stand_num, 109)) { // 连珠 no crit
        var cs_base = (info_self.get('cs') - Set_Special.get('clipsize_' + stand_num) + 1)
        if (parseInt(cs_base / 4) > 0 && cs_base - 4 * parseInt(cs_base / 4) === 0) {
            if (is_this(stand_num, 77)) _mul_dmg *= 2.4
            else if (is_this(stand_num, 85)) _mul_dmg *= 2.6
            else if (is_this(stand_num, 109)) _mul_dmg *= 3
            no_crit = true
        }
    }
    else if (is_this(stand_num, 173)) { // pkp
        if (Set_Special.get('pkp_nextcrit_' + stand_num) === undefined) Set_Special.set('pkp_nextcrit_' + stand_num, 'ready') // Ultimatum init
        else if (Set_Special.get('pkp_nextcrit_' + stand_num) === 'extra') {
            Set_Special.set('pkp_nextcrit_' + stand_num, 'over')
            _mul_dmg *= 1.5
        }
    }
    else if (is_this(stand_num, 194)) { // K2
        if (Set_Special.get('k2_temp_' + stand_num) > 15) _mul_acu *= Math.pow(0.98, Set_Special.get('k2_temp_' + stand_num) - 15) // overheat
        if (Set_Special.get('k2_' + stand_num) === 'fever') {
            if (Set_Special.get('k2_temp_' + stand_num) < 35) Set_Special.set('k2_temp_' + stand_num, Set_Special.get('k2_temp_' + stand_num) + 1) // fever temp up
        } else {
            if (Set_Special.get('k2_temp_' + stand_num) > 0) Set_Special.set('k2_temp_' + stand_num, Set_Special.get('k2_temp_' + stand_num) - 1) // note temp down
            if (Set_Special.get('k2_dmgup_' + stand_num) < 10) Set_Special.set('k2_dmgup_' + stand_num, Set_Special.get('k2_dmgup_' + stand_num) + 1) // note dmg up
        }
    }
    else if (is_this(stand_num, 197)) { // carcano m1891
        if (Set_Special.get('karm1891') === undefined) Set_Special.set('karm1891', 0)
        if (Math.random() <= 0.4 && Set_Special.get('karm1891') < 3) {
            var num_col = Math.ceil(stand_num / 3) + 1
            react([createSkill(0, 0, 2, describe_property(['col' + num_col], ['rof/crit'], ['0.04/0.04'])), 0], stand_num, global_frame)
            changeStatus(stand_num, 'self', 'rof', '0', 2)
            Set_Special.set('karm1891', Set_Special.get('karm1891') + 1)
        }
    }
    else if (is_this(stand_num, 198)) { // carcano m91/38 passive
        if (Set_Special.get('karm9138_' + stand_num) === undefined) Set_Special.set('karm9138_' + stand_num, 0)
        if (Math.random() <= 0.7) {
            Set_Special.set('karm9138_' + stand_num, Set_Special.get('karm9138_' + stand_num) + 2)
        }
    }
    else if (is_this(stand_num, 214)) { // ADS
        if (Set_Special.get('ADS_active') != undefined && Set_Special.get('ADS_active') >= global_frame) { // active buff duration
            if (Set_Special.get('ADS_buff') === undefined) Set_Special.set('ADS_buff', 1)
            else Set_Special.set('ADS_buff', Set_Special.get('ADS_buff') + 1)
        } else { // passive
            if (Math.random() <= 0.4) {
                if (Set_Special.get('ADS_buff') === undefined) Set_Special.set('ADS_buff', 1)
                else Set_Special.set('ADS_buff', Set_Special.get('ADS_buff') + 1)
            }
        }
        if (Set_Special.get('ADS_buff') != undefined && Set_Special.get('ADS_buff') >= 5) {
            Set_Special.set('ADS_buff', 0)
            var aoe_ratio = parseFloat(document.getElementById('special_ads').value) / 100
            var ads_dmg_aoe = Math.ceil(aoe_ratio * 6 * Math.ceil(info_self.get('dmg') * (Math.random() * 0.3 + 0.85)) * explain_fgl_ff('aoe'))
            recordData(stand_num, global_frame, ads_dmg_aoe)
        }
    }
    else if (is_this(stand_num, 221)) { // manga-gun must crit active
        if (Set_Special.get('multi_' + stand_num) != undefined && Set_Special.get('multi_' + stand_num)[1] >= global_frame) must_crit = true
    }
    else if (is_this(stand_num, 245)) { // P90
        if (Set_Special.get('p90_' + stand_num) > 0) {
            must_acu = true
            must_crit = true
            Set_Special.set('p90_' + stand_num, Set_Special.get('p90_' + stand_num) - 1)
        }
    }
    else if (is_this(stand_num, 256)) { // falcon special bullet acu up
        if (Set_Special.get('falcon_' + stand_num) > 0) _mul_acu *= Math.pow(1.18, Set_Special.get('falcon_' + stand_num))
    }
    else if (is_this(stand_num, 261)) { // QBU-88 passive
        if (Set_Special.get('qbu88_' + stand_num) === 2) {
            Set_Special.set('qbu88_' + stand_num, 0)
            var explode_percent = parseFloat(document.getElementById('special_qbu88_' + (stand_num + 1)).value) / 100
            var explode_dmg = 1.5 * info_self.get('dmg') * explain_fgl_ff('aoe') * explode_percent
            recordData(stand_num, global_frame, explode_dmg)
        } else {
            Set_Special.set('qbu88_' + stand_num, Set_Special.get('qbu88_' + stand_num) + 1)
        }
    }
    else if (is_this(stand_num, 270)) { // type4
        Set_Special.set('type4_' + stand_num, Set_Special.get('type4_' + stand_num) + 1)
    }
    else if (is_this(stand_num, 274)) {
        var list_debuff = ['enemy_dmg', 'enemy_rof', 'enemy_acu', 'enemy_eva', 'enemy_arm',
            'enemy_speed', 'enemy_dot', 'enemy_dizz']
        var num_debuff = 0
        for (var debuff of list_debuff) {
            if (Set_Special.get(debuff) >= global_frame) {
                num_debuff++
            }
        }
        if (num_debuff > 0) _mul_dmg = 1.05 + 0.05 * num_debuff
    }
    else if (is_this(stand_num, 1005)) { // nagant revolver mod
        if (Set_Special.get('m1895_' + stand_num) === 0) { // reload 7x
            changeStatus(stand_num, 'all', 'dmg', '0.1', 4)
            changeStatus(stand_num, 'all', 'acu', '0.1', 4)
        }
        Set_Special.set('m1895_' + stand_num, Set_Special.get('m1895_' + stand_num) + 1)
        if (Set_Special.get('m1895_' + stand_num) === 7) Set_Special.set('m1895_' + stand_num, 0)
    }
    else if (is_this(stand_num, 1060)) { // asval mod
        if (Set_Special.get('asval_' + stand_num) > global_frame) must_acu = true
    }
    else if (is_this(stand_num, 2012)) { // sei: help stella add buff
        if (is_exist_someone(2014)) {
            if (Set_Special.get('stella_num') === undefined) Set_Special.set('stella_num', 1)
            else Set_Special.set('stella_num', Set_Special.get('stella_num') + 1)
        }
    }
    else if (is_this(stand_num, 2014)) { // stella critdmg buff
        if (Set_Special.get('stella_buff') === true) {
            _mul_critdmg *= 1.5
            Set_Special.set('stella_buff', false)
        }
    }
    return [
        ['dmg', _mul_dmg], ['acu', _mul_acu], ['critdmg', _mul_critdmg],
        ['must_acu', must_acu], ['must_crit', must_crit],
        ['no_crit', no_crit]]
}

function settle_normal_attack(stand_num, info_self, info_enemy, list_buff) {
    var _para_arm = Math.min(2, _pro('ap', info_self) - _pro('e_arm', info_enemy)),
        _para_dmg = _pro('dmg', info_self) * _mul('dmg', list_buff)
    // damage benifit for special t-doll skill
    if (info_self.get('type') === 6) { // SG normal attack
        if (is_this(stand_num, 2016)) true // Dana do nothing
        else {
            if (Set_Special.get('sg_ammo_type_' + stand_num) != undefined) { // SG with single-bullet
                if (is_this(stand_num, 163)) { // AA-12
                    if (Set_Special.get('aa12_' + stand_num) != undefined && Set_Special.get('aa12_' + stand_num) > global_frame) {
                        if (Set_Special.get('aa12_skillmode_' + stand_num) === true) { // skill mode: 3 targets
                            Set_Special.set('aa12_skillmode_' + stand_num, false)
                        } else { // single-bullet mode
                            Set_Special.set('aa12_skillmode_' + stand_num, true)
                            _para_dmg *= 3 // x3 dmg
                        }
                    }
                } else {
                    if (Set_Special.get('aim_time_' + stand_num) === undefined || Set_Special.get('aim_time_' + stand_num) < global_frame) {
                        _para_dmg *= 3 // no forcus-multiple-targer, x3 dmg
                    }
                }
            }
        }
    }
    if (is_this(stand_num, 194)) { // K2
        if (Set_Special.get('k2_' + stand_num) === 'fever') _para_dmg *= 0.52 // fever
        else _para_dmg *= Math.pow(1.05, Set_Special.get('k2_dmgup_' + stand_num)) // note
        if (Set_Special.get('k2_temp_' + stand_num) > 15) _para_dmg *= Math.pow(0.98, Set_Special.get('k2_temp_' + stand_num) - 15) // overheat buff
    }
    else if (is_this(stand_num, 256)) { // falcon
        if (Set_Special.get('falcon_' + stand_num) > 0) {
            _para_dmg *= Math.pow(1.18, Set_Special.get('falcon_' + stand_num))
        }
        _para_dmg *= 1.5
    }
    else if (is_this(stand_num, 1002)) { // M1911 MOD
        if (Set_Special.get('m1911_' + stand_num) > 0) _para_dmg *= 2
    }
    else if (is_this(stand_num, 1039)) { // Mosin Nagant MOD
        if (Set_Special.get('mosin_bufftime_' + stand_num) >= global_frame) _para_dmg *= 1.2
        if (Set_Special.get('mosin_' + stand_num) <= 1) { // can refresh buff
            Set_Special.set('mosin_bufftime_' + stand_num, global_frame + 89)
            Set_Special.set('mosin_' + stand_num, Set_Special.get('mosin_numneed_' + stand_num))
        } else Set_Special.set('mosin_' + stand_num, Set_Special.get('mosin_' + stand_num) - 1)
    }
    else if (is_this(stand_num, 1075)) { // M1918 MOD
        if (_pro('cs', info_self) - Set_Special.get('clipsize_' + stand_num) < 3) _para_dmg *= 1.4
    }
    else if (is_this(stand_num, 2008)) { // seele
        if (Set_Special.get('clipsize_' + stand_num) === 1) _para_dmg *= 3
    }
    else if (is_this(stand_num, 2016)) _para_dmg *= 1.8 // Dana
    // Universal formulation of damage settlement
    return Math.max(1, Math.ceil(_para_dmg * _pro('random') + _para_arm))
}

function settle_numbers(stand_num, info_self, enemy_arm, enemy_num_left, list_buff) {
    var num = 1
    if (is_this(stand_num, 194)) { // K2判断模式射击次数
        if (Set_Special.get('k2_' + stand_num) === 'fever') final_dmg *= 3
    }
    else if (is_this(stand_num, 276)) { // Kord
        if (Set_Special.get('kord_' + stand_num) === 'type_p') num *= enemy_num_left
    }
    if (info_self.get('type') === 6) { // SG攻击，目标数特殊处理
        if (is_this(stand_num, 2016)) { // 达娜攻击不受任何子弹影响，恒定1目标
            num = 1
        } else {
            if (Set_Special.get('aim_time_' + stand_num) >= global_frame) { // 强制攻击几个目标，顶替独头弹效果
                var aim_num = Set_Special.get('aim_forceon_' + stand_num)
                if (enemy_num_left >= aim_num) num = aim_num
                else num = enemy_num_left
            } else { // 没有强制目标数
                if (Set_Special.get('sg_ammo_type_' + stand_num) === undefined) { // SG未携带独头弹，默认3目标
                    if (enemy_num_left >= 3) num = 3
                    else num = enemy_num_left
                } else { // 如果携带，可能因为技能攻击多个目标
                    if (is_this(stand_num, 163)) { // AA-12酮血症BUG
                        if (Set_Special.get('aa12_' + stand_num) != undefined && Set_Special.get('aa12_' + stand_num) > global_frame && Set_Special.get('aa12_skillmode_' + stand_num) === false) {
                            if (enemy_num_left >= 3) num = 3
                            else num = enemy_num_left
                        }
                    }
                }
            }
        }
    }
    return num
}

function settle_specialskill(stand_num, info_self, info_enemy, final_dmg) {
    var _para_arm = Math.min(2, _pro('ap', info_self) - _pro('e_arm', info_enemy))
    if (is_this(stand_num, 4)) {
        if (Set_Special.get('python_active') === 0 && Set_Special.get('python_opening') === true) {
            final_dmg *= 2 // 无畏者之拥结束双发
            Set_Special.set('python_active', -1)
            Set_Special.set('python_opening', false)
        }
    }
    else if (is_this(stand_num, 272)) { // desert eagle
        if (Set_Special.get('DE_active_' + stand_num) != undefined && Set_Special.get('DE_active_' + stand_num) >= global_frame) { // active skill-on
            if (Set_Special.get('DE_bullet_' + stand_num) != undefined && Set_Special.get('DE_bullet_' + stand_num) > 0) { // bullet dmg_up
                Set_Special.set('DE_bullet_' + stand_num, Set_Special.get('DE_bullet_' + stand_num) - 1) // lost bullet buff
                Set_Special.set('DE_multiple_' + stand_num, Math.pow(1.6, 3 - Set_Special.get('DE_bullet_' + stand_num)))
            }
        } else {
            Set_Special.set('DE_multiple_' + stand_num, 1)
        }
        final_dmg *= Set_Special.get('DE_multiple_' + stand_num)
    }
    else if (is_this(stand_num, 1057)) { // 如果AR-15 MOD
        var ar15_list_status = Set_Status.get(stand_num)
        var len_list = ar15_list_status.length
        for (var i = 0; i < len_list; i++) {
            if (ar15_list_status[i][0][0] === 'rof' && ar15_list_status[i][0][1] === 1.5) { // 突击专注期间
                var extra_dmg = 0
                if (Set_EnemyStatus.get('avenger_mark') === true) {
                    extra_dmg = Math.max(1, Math.ceil(0.2 * info_self.get('dmg') * _pro('random') + _para_arm)) // 20%火力
                } else {
                    extra_dmg = Math.max(1, Math.ceil(0.1 * info_self.get('dmg') * _pro('random') + _para_arm)) // 10%火力
                }
                if (Math.random() + info_self.get('crit') >= 1) extra_dmg = Math.ceil(extra_dmg * info_self.get('critdmg'))
                final_dmg += extra_dmg
                break
            }
        }
    }
    else if (is_this(stand_num, 2015)) { // Alma无人机
        if (Set_Special.get('alma_' + stand_num) >= global_frame) {
            var pod_dmg = info_self.get('dmg') * 0.4
            var pod_final_dmg = Math.max(1, Math.ceil(pod_dmg * _pro('random') + _para_arm))
            final_dmg += 2 * pod_final_dmg
        }
    }
    return final_dmg
}

function settle_accuracy(stand_num, info_self, info_enemy, list_buff) {
    var acu = info_self.get('acu'),
        e_eva = info_enemy,
        is_hit = false,
        must_acu = _mul('must_acu', list_buff)
    if (must_acu || (Math.random() <= acu / (acu + e_eva))) is_hit = true
    return is_hit
}

function settle_crit(stand_num, info_self, list_buff) {
    var is_crit = false,
        must_crit = false,
        no_crit = false,
        critdmg_para = 1
    must_crit = _mul('must_crit', list_buff) ||
        (Set_Special.get('must_crit_' + stand_num) != undefined) ||
        (Set_Special.get('skill_mustcrit_' + stand_num) != undefined && Set_Special.get('skill_mustcrit_' + stand_num) >= current_time)
    no_crit = _mul('no_crit', list_buff)
    if (no_crit) is_crit = false
    else if (must_crit || Math.random() + info_self.get('crit') >= 1) is_crit = true
    if (is_crit) critdmg_para *= info_self.get('critdmg') * _mul('critdmg', list_buff)
    return critdmg_para
}