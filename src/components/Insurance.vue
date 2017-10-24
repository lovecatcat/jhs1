<template>
  <div class="insurance">
    <div class="am-list am-list-6lb form">
      <div class="am-list-item dropdown" :class="{up:showAll}">
        <div class="form-header fn-clear form-header__dropdown" @click="toggle">
          <div class="fn-left">
            <span>{{plan_name ? plan_name : '险种信息'}}</span>
          </div>
          <div class="arrow-icon" :class="{active:showAll}"></div>
          <div class="fn-right" style="margin-right: .3rem;" @click.stop="delIns">
            <i class="am-icon-clear am-icon"></i> 删除
          </div>
        </div>
        <div class="am-list-dropdown-list" v-if="insList">
          <app-select label="公司品牌">
            <select v-model='sc_id' @change="companyChanged">
              <option disabled value=''>请选择</option>
              <option v-for="item,index in insList.company" :key="index" :value="item.sc_id">{{item.company_name}}
              </option>
            </select>
          </app-select>
          <app-select label="险种">
            <select v-model='mainInsurance' @change="insChanged">
              <option disabled value=''>请选择</option>
              <option v-for="item,index in insList.main[sc_id]" v-if="sc_id" :key="index" :value="item">{{item.name}}
              </option>
            </select>
          </app-select>
          <app-select label="保险期间" :readonly="mainSyAttr.length === 1">
            <select v-model.number='insurance.safe_year'
                    :disabled="mainSyAttr.length === 1"
                    @change="resetFee">
              <option disabled value=''>请选择</option>
              <option v-for="(item,index) in mainSyAttr" :value="item.safe_year" :key="index">
                {{item.safe_year | safeYearFilter}}
              </option>
            </select>
          </app-select>
          <app-select label="缴费年限" :readonly="mainPyAttr.length === 1">
            <select v-model.number='insurance.pay_year'
                    :disabled="mainPyAttr.length === 1"
                    @change="resetFee">
              <option disabled value=''>请选择</option>
              <option v-for="(item,index) in mainPyAttr" :value="item.pay_year" :key="index">
                {{item.pay_year === '1' ? '趸交' : item.pay_year + '年交'}}
              </option>
            </select>
          </app-select>
          <template v-if="insurance.safe_id">
            <!-- 输入保额算保费 -->
            <template v-if="isBaseMoney&&!fuBaseMoney&&insurance.safe_id !== '366'">
              <app-select label="计划类型" v-if="prospectus_types.length > 0">
                <select
                  v-model.number="prospectus_type"
                  v-if="prospectus_types" @change="resetFee">
                  <option disabled value=''>请选择</option>
                  <option v-for="item in prospectus_types" :value="item.value">{{item.name}}</option>
                </select>
              </app-select>
              <app-select label="领取年龄" v-if="insurance.safe_id === '205'">
                <select v-model.number="flag['205']" @change="resetFee">
                  <option disabled value=''>请选择</option>
                  <option value="60">60岁</option>
                  <option value="65">65岁</option>
                  <option value="70">70岁</option>
                  <option value="75">75岁</option>
                </select>
              </app-select>
              <app-input label="基本保额"
                         v-if="insurance.safe_id !== '292'"
                         v-show="insurance.safe_id !== '309' &&
                          insurance.safe_id !== '280'">
                <input slot="input"
                       v-model.number.lazy="insurance.money"
                       type="number" placeholder="请填写基本保险金额（元）"
                       @change="resetFee">
                <div slot="icon"
                     @click="insurance.money = ''"
                     v-show="insurance.money != ''"
                     class="am-list-clear">
                  <i class="am-icon-clear am-icon"></i>
                </div>
              </app-input>
              <template v-else>
                <app-select label="投保份数">
                  <select
                    v-model.number="insurance.money"
                    @change="resetFee">
                    <option disabled value="">请选择份数</option>
                    <option :value="n" v-for="n in 4">{{n}}</option>
                  </select>
                </app-select>
                <app-input label="基本保额">
                  <div slot="input">{{insurance.money * 50000}}</div>
                </app-input>
              </template>
              <app-input label="年缴保费">
                <input slot="input"
                       readonly
                       v-model.number.lazy="insurance.period_money"
                       type="number"
                       placeholder="年缴保费（元）">
                <div slot="button" class="am-list-button">
                  <button type="button" @click="calMoney(true)">点击计算</button>
                </div>
              </app-input>
            </template>
            <!-- 输入保额算保费 -->
            <!-- 泰康乐行天下 -->
            <template v-else-if="isBaseMoney&&fuBaseMoney">
              <app-input label="基本保额">
                <input slot="input" readonly
                       v-model.number.lazy="insurance.money"
                       type="number"
                       placeholder="完善附加险再计算">
              </app-input>
              <app-input label="年缴保费">
                <input slot="input" readonly
                       v-model.number.lazy="insurance.period_money"
                       type="number"
                       placeholder="完善附加险再计算">
                <div slot="button" class="am-list-button">
                  <button type="button" @click="calMoney(true)">点击计算</button>
                </div>
              </app-input>
            </template>
            <!-- 泰康乐行天下 -->
            <!-- 复星乐健一生366 -->
            <template v-else-if="isBaseMoney&&!fuBaseMoney &&insurance.safe_id === '366'">
              <app-input label="有无社保">
                <div class="am-ft-left" slot="input">
                  <label class="radio sex-radio">
                    <div class="am-checkbox">
                      <input type="radio" value="B" v-model="fxljys366.shebao" @change="resetFee('fxsb')">
                      <span class="icon-check" aria-hidden="true" style="top: -0.08rem"></span>
                    </div>
                    <span>有</span>
                  </label>
                  <label class="radio sex-radio">
                    <div class="am-checkbox">
                      <input type="radio" value="A" v-model="fxljys366.shebao" @change="resetFee('fxsb')">
                      <span class="icon-check" aria-hidden="true" style="top: -0.08rem;"></span>
                    </div>
                    <span>无</span>
                  </label>
                </div>
              </app-input>
              <div class="am-ft-md" style="padding: .1rem 0.15rem">乐健一生住院医疗保险</div>
              <app-select label="套餐">
                <select v-model.number="fxljys366.zytc"
                        @change="resetFee">
                  <option disabled value='0'>请选择</option>
                  <option value="住院套餐一">住院套餐一</option>
                  <option value="住院套餐二">住院套餐二</option>
                  <option value="住院套餐三">住院套餐三</option>
                  <option value="住院套餐六">住院套餐六</option>
                </select>
              </app-select>
              <app-select label="住院免赔额">
                <select v-model.number="fxljys366.zynmp"
                        @change="resetFee">
                  <option disabled value='0'>请选择</option>
                  <option value="1">0免赔</option>
                  <option value="0.6">一万免赔</option>
                  <option value="0.5">二万免赔</option>
                </select>
              </app-select>
             <!--  <app-select label="自负比例">
                <select v-model.number="fxljys366.zyzfbl"
                        @change="resetFee">
                  <option disabled value=''>请选择</option>
                  <option value="1">0%</option>
                  <option value="0.9">10%</option>
                  <option value="0.8">20%</option>
                  <option value="0.7">30%</option>
                  <option value="0.6">40%</option>
                  <option value="0.5">50%</option>
                </select>
              </app-select> -->
              <app-input label="年缴保费">
                <input slot="input"
                       readonly
                       v-model.number.lazy="insurance.period_money"
                       type="number"
                       placeholder="年缴保费（元）">
                <div slot="button" class="am-list-button">
                  <button type="button" @click="calMoney(true)">点击计算</button>
                </div>
              </app-input> 
            </template>
            <!-- 复星乐健一生 -->
            <!-- 输入保费算保额 -->
            <template v-else>
              <app-select label="计划类型" v-if="prospectus_types.length > 0">
                <select v-model.number="prospectus_type"
                        v-if="prospectus_types"
                        @change="resetFee">
                  <option disabled value=''>请选择</option>
                  <option v-for="item in prospectus_types" :value="item.value">{{item.name}}</option>
                </select>
              </app-select>
              <app-select label="领取年龄" v-if="insurance.safe_id === '352'">
                <!-- 中国人保尊赢人生 -->
                <select v-model.number="flag['352']" @change="resetFee">
                  <option disabled value=''>请选择</option>
                  <option value="60">60岁</option>
                  <option value="80">80岁</option>
                </select>
              </app-select>
              <app-input label="年缴保费">
                <input slot="input"
                       v-model.number.lazy="insurance.period_money"
                       type="number" placeholder="请填写年缴保费（元）"
                       @change="resetFee">
                <div slot="icon"
                     v-show="insurance.period_money != ''"
                     @click="insurance.period_money = ''"
                     class="am-list-clear">
                  <i class="am-icon-clear am-icon"></i>
                </div>
              </app-input>
              <app-input label="基本保额">
                <input slot="input"
                       readonly
                       v-model.number.lazy="insurance.money"
                       type="number"
                       placeholder="基本保险金额（元）">
                <div slot="button" class="am-list-button">
                  <button type="button" @click="calMoney(true)">点击计算</button>
                </div>
              </app-input>
            </template>
            <!-- 输入保费算保额 -->
          </template>
        </div>
      </div>
    </div>
    <app-dropdown
      :ref="'applicant_' + item.safe_id"
      v-for="item,index in Addons"
      :key="item.safe_id"
      :id="'ins-' + insIndex + '_fj-' + item.safe_id"
      v-show="showAll">
      <template slot="header">
        <div class="am-ft-md" style="width: 70%"> {{item.name}}</div>
        <div class="am-list-extra" style="min-width:.44rem">投保&nbsp;</div>
        <div class="am-switch">
          <input type="checkbox" @change="chAddonState(item.safe_id)" v-model="addonsSelected[item.safe_id]"
                 class="am-switch-checkbox" :id="'ins-' + insIndex + '_applicant-'+item.safe_id">
          <label class="am-switch-label" :for="'ins-' + insIndex + 'applicant_'+item.safe_id">
            <div class="am-switch-inner"></div>
            <div class="am-switch-switch"></div>
          </label>
        </div>
      </template>
      <!--  乐健一生门急诊医疗保险 -->
      <template v-if="item.safe_id==='374' && addonsSelected[item.safe_id]">
        <app-select label="套餐">
          <select v-model.number="fxljys366.mztc"
                  @change="resetFee('fxmz')">
            <option disabled value='0'>请选择</option>
            <option value="门急诊套餐一">门急诊套餐一</option>
            <option value="门急诊套餐二">门急诊套餐二</option>
          </select>
        </app-select>
        <app-select label="住院免赔额">
          <select v-model.number="fxljys366.mznmp"
                  @change="resetFee('fxmz')">
            <option disabled value='0'>请选择</option>
            <option value="1">0免赔</option>
            <option value="0.92">500元</option>
          </select>
        </app-select>
        <app-input label="年缴保费">
          <input slot="input"
                 readonly
                 v-model.number.lazy="fxljys366.mzmoney"
                 type="number"
                 placeholder="年缴保费（元）">
          <div slot="button" class="am-list-button">
            <button type="button" @click="flagChanged(item.safe_id)">点击计算</button>
          </div>
        </app-input>
      </template>
      <!--  乐健一生门急诊医疗保险 -->
      <!--  附加康乐一生轻症保险 -->
      <template v-if="(item.safe_id==='368') && addonRes[item.safe_id]">
        <div class="am-list-item">
          <div class="am-list-content">保障期间</div>
          <div class="am-ft-black">{{mainSafeYear === 999 ? '终身' : mainSafeYear+'年'}}</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">缴费期间</div>
          <div class="am-ft-black">{{mainPayYear}}年交</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">保险金额</div>
          <div class="am-ft-orange">{{insurance.money * 0.2}}</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">年缴保费</div>
          <div class="am-ft-orange">{{addonRes[item.safe_id]['年缴保费']}}</div>
        </div>
      </template>
      <!--  附加康乐一生轻症保险 -->
      <!-- 附加康乐一生投保人豁免保费重大疾病保险 -->
      <template v-if="(item.safe_id==='367') && addonRes[item.safe_id]">
        <div class="am-list-item">
          <div class="am-list-content">保障期间</div>
          <div class="am-ft-black">{{mainPayYear - 1}}</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">缴费期间</div>
          <div class="am-ft-black">{{mainPayYear - 1}}年交</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">保险金额</div>
          <div class="am-ft-orange" v-if="addonRes[368]">{{insurance.period_money + addonRes[368].年缴保费}}</div>
          <div class="am-ft-orange" v-else>{{insurance.period_money}}</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">年缴保费</div>
          <div class="am-ft-orange">{{addonRes[item.safe_id]['年缴保费']}}</div>
        </div>
      </template>
      <!-- 附加康乐一生投保人豁免保费重大疾病保险 -->
      <!-- 附加健康两全保险 -->
      <template v-if="item.safe_id==='362' && addonsSelected[item.safe_id]">
        <app-select label="保障期间">
          <select v-model.number="flag[item.safe_id]" @change="flagChanged(item.safe_id)">
            <option disabled value=''>请选择</option>
            <option value="70">70岁</option>
            <option value="75">75岁</option>
            <option value="79">79岁</option>
          </select>
        </app-select>
        <template v-if="addonRes[item.safe_id]">
          <div class="am-list-item">
            <div class="am-list-content">缴费期间</div>
            <div class="am-ft-black">{{mainPayYear}}年</div>
          </div>
          <div class="am-list-item">
            <div class="am-list-content">年缴保费</div>
            <div class="am-ft-orange">{{addonRes[item.safe_id]['年缴保费']}}</div>
          </div>
        </template>
      </template>
      <!-- 附加健康两全保险 -->
      <!-- 附加品质生活年金保险 -->
      <template v-if="item.safe_id==='354'">
        <app-input label="年缴保费">
          <input slot="input"
                 v-model.number="cache.derate_money354"
                 type="number"
                 placeholder="基本保险金额（元）"
                 @change="chAddonState(item.safe_id)">
          <div slot="icon"
               v-show="cache.derate_money354 !== ''"
               @click="cache.derate_money354 = ''"
               class="am-list-clear">
            <i class="am-icon-clear am-icon"></i>
          </div>
        </app-input>
        <div class="am-notice" role="alert">
          <div class="am-notice-content">年缴保费为1000元整数倍，可为0</div>
        </div>
      </template>
      <!-- 附加品质生活年金保险 -->
      <!-- 附加金账户年金保险 -->
      <template v-if="item.safe_id==='349'">
        <app-input label="年缴保费">
          <input slot="input"
                 v-model.number="cache.derate_money349"
                 type="number"
                 placeholder="基本保险金额（元）"
                 @change="addonsSelected[item.safe_id] = true, flagChanged(item.safe_id)">
                 <!-- @change="addonsSelected[item.safe_id] = true, chAddonState(item.safe_id)"> -->
          <div slot="icon"
               v-show="cache.derate_money349 !== ''"
               @click="cache.derate_money349 = ''"
               class="am-list-clear">
            <i class="am-icon-clear am-icon"></i>
          </div>
        </app-input>
        <div class="am-notice" role="alert">
          <div class="am-notice-content">年缴保费为1000元整数倍，可为0</div>
        </div>
      </template>
      <!-- 附加金账户年金保险 -->
      <!-- 附加乐行天下意外住院津贴 -->
      <template v-if="item.safe_id === '333' && addonsSelected[item.safe_id]">
        <template v-if="addonRes[item.safe_id]">
          <div class="am-list-item">
            <div class="am-list-content">保障金额</div>
            <div class="am-ft-black">100元/日</div>
          </div>
          <div class="am-list-item">
            <div class="am-list-content">保障期间</div>
            <div class="am-ft-black">{{mainSafeYear}}年</div>
          </div>
          <div class="am-list-item">
            <div class="am-list-content">缴费期间</div>
            <div class="am-ft-black">{{mainPayYear}}年</div>
          </div>
          <div class="am-list-item">
            <div class="am-list-content">年缴保费</div>
            <div class="am-ft-orange" v-model.number="cache.pay_money333">{{addonRes[item.safe_id]['年缴保费']}}</div>
          </div>
        </template>
      </template>
      <!-- 附加乐行天下意外住院津贴  -->
      <!-- 附加乐行天下意外伤害 -->
      <template v-if="item.safe_id === '332' && addonsSelected[item.safe_id]">
        <app-select label="保险金额">
          <select v-model.number="flag[item.safe_id]" @change="flagChanged(item.safe_id)">
            <option disabled value=''>请选择</option>
            <option value="100000">100000</option>
            <option value="200000">200000</option>
            <option value="300000">300000</option>
          </select>
        </app-select>
        <template v-if="addonRes[item.safe_id]">
          <div class="am-list-item">
            <div class="am-list-content">保障期间</div>
            <div class="am-ft-black">{{mainSafeYear}}年</div>
          </div>
          <div class="am-list-item">
            <div class="am-list-content">缴费期间</div>
            <div class="am-ft-black">{{mainPayYear}}年</div>
          </div>
          <div class="am-list-item">
            <div class="am-list-content">年缴保费</div>
            <div class="am-ft-orange" v-model.number="cache.pay_money332">{{addonRes[item.safe_id]['年缴保费']}}</div>
          </div>
        </template>
      </template>
      <!-- 附加乐行天下意外伤害  -->
      <!-- 附加恒祥 -->
      <template v-if="item.safe_id === '295' && addonsSelected[item.safe_id]">
        <app-input label="保险金额">
          <input slot="input"
                 v-model.number="cache.base_money295"
                 type="number" placeholder="保险金额(元)"
                 
                 @change="addonsSelected[item.safe_id] = true, flagChanged(item.safe_id)">
                 <!-- @change="addonRes[item.safe_id]=null,addonsSelected[item.safe_id]=false"> -->
          <div slot="icon"
               @click="cache.base_money295 = ''"
               v-show="cache.base_money295 != ''"
               class="am-list-clear">
            <i class="am-icon-clear am-icon"></i>
          </div>
        </app-input>
        <div class="am-list-footer"><span class='am-ft-orange'>最低50元,10的整数倍。累计不超过100元/天</span>
        </div>
        <template v-if="addonRes[item.safe_id]">
          <div class="am-list-item">
            <div class="am-list-content">保障期间</div>
            <div class="am-ft-black">终身</div>
          </div>
          <div class="am-list-item">
            <div class="am-list-content">缴费期间</div>
            <div class="am-ft-black">趸缴</div>
          </div>
          <div class="am-list-item">
            <div class="am-list-content">保险金额</div>
            <div class="am-ft-orange">{{cache.base_money295}}</div>
          </div>
          <div class="am-list-item">
            <div class="am-list-content">年缴保费</div>
            <div class="am-ft-orange">{{addonRes[item.safe_id]['年缴保费']}}</div>
          </div>
        </template>
      </template>
      <!-- 附加恒祥 -->
      <!-- 附加恒顺 -->
      <template v-else-if="item.safe_id === '294' && addonsSelected[item.safe_id]">
        <app-select label="保险金额">
          <select v-model.number="flag[item.safe_id]" @change="flagChanged(item.safe_id)">
            <option disabled value=''>请选择</option>
            <option value="2000">2000</option>
            <option value="3000">3000</option>
            <option value="4000">4000</option>
            <option value="5000">5000</option>
            <option value="6000">6000</option>
            <option value="7000">7000</option>
            <option value="8000">8000</option>
            <option value="9000">9000</option>
            <option value="10000">10000</option>
            <option value="15000">15000</option>
            <option value="20000">20000</option>
            <option value="52000">5类职业2000</option>
            <option value="53000">5类职业3000</option>
            <option value="54000">5类职业4000</option>
            <option value="55000">5类职业5000</option>
            <option value="56000">5类职业6000</option>
            <option value="57000">5类职业7000</option>
            <option value="58000">5类职业8000</option>
            <option value="59000">5类职业9000</option>
            <option value="510000">5类职业10000</option>
            <option value="515000">5类职业15000</option>
            <option value="520000">5类职业20000</option>
            <option value="62000">6类职业2000</option>
            <option value="63000">6类职业3000</option>
            <option value="64000">6类职业4000</option>
            <option value="65000">6类职业5000</option>
            <option value="66000">6类职业6000</option>
            <option value="67000">6类职业7000</option>
            <option value="68000">6类职业8000</option>
            <option value="69000">6类职业9000</option>
            <option value="610000">6类职业10000</option>
            <option value="615000">6类职业15000</option>
            <option value="620000">6类职业20000</option>
          </select>
        </app-select>
        <template v-if="addonRes[item.safe_id]">
          <div class="am-list-item">
            <div class="am-list-content">保障期间</div>
            <div class="am-ft-black">终身</div>
          </div>
          <div class="am-list-item">
            <div class="am-list-content">缴费期间</div>
            <div class="am-ft-black">趸缴</div>
          </div>
          <div class="am-list-item">
            <div class="am-list-content">保险金额</div>
            <div class="am-ft-orange">
              {{flag[item.safe_id] > 50000 ? flag[item.safe_id].toString().substr(1) : flag[item.safe_id]}}
            </div>
          </div>
          <div class="am-list-item">
            <div class="am-list-content">年缴保费</div>
            <div class="am-ft-orange">{{addonRes[item.safe_id]['年缴保费']}}</div>
          </div>
        </template>
      </template>
      <!-- 附加恒顺 -->
      <!-- 金财人生终身年金保险D款 -->
      <template v-else-if="item.safe_id==='291' && addonsSelected[item.safe_id]">
        <div class="am-list-item">
          <div class="am-list-content">保障期间</div>
          <div class="am-ft-black">终身</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">缴费期间</div>
          <div class="am-ft-black">趸交</div>
        </div>
        <app-input label="年缴保费">
          <input slot="input"
                 v-model.number="cache.derate_money291"
                 type="number"
                 placeholder="基本保险金额（元）"
                 @change="addonsSelected[item.safe_id] = true, flagChanged(item.safe_id)">
          <div slot="icon" v-show="cache.derate_money291 !== ''" class="am-list-clear"><i
            class="am-icon-clear am-icon" @click="cache.derate_money291 = ''"></i></div>
        </app-input>
        <div class="am-notice" role="alert">
          <div class="am-notice-content">年缴保费为1000元整数倍，可为0</div>
        </div>
      </template>
      <!-- 金财人生终身年金保险D款 -->
      <!-- 附加尊享安康费用补偿医疗保险 -->
      <template v-else-if="item.safe_id === '293' && addonsSelected[item.safe_id]">
        <app-select label="保险金额">
          <select v-model.number="flag[item.safe_id]" @change="flagChanged(item.safe_id)">
            <option disabled value=''>请选择</option>
            <option value="150">有社保50万</option>
            <option value="250">无社保50万</option>
          </select>
        </app-select>
        <template v-if="addonRes[item.safe_id]">
          <div class="am-list-item">
            <div class="am-list-content">保障期间</div>
            <div class="am-ft-black">1年</div>
          </div>
          <div class="am-list-item">
            <div class="am-list-content">缴费期间</div>
            <div class="am-ft-black">趸缴</div>
          </div>
          <div class="am-list-item">
            <div class="am-list-content">保险金额</div>
            <div class="am-ft-orange">500000</div>
          </div>
          <div class="am-list-item">
            <div class="am-list-content">年缴保费</div>
            <div class="am-ft-orange">{{addonRes[item.safe_id]['年缴保费']}}</div>
          </div>
        </template>
      </template>
      <!-- 附加尊享安康费用补偿医疗保险 -->
      <!-- 附加投保人豁免保险费重大疾病保险（2017 版） -->
      <template v-else-if="(item.safe_id==='289') && addonRes[item.safe_id]">
        <div class="am-list-item">
          <div class="am-list-content">保障期间</div>
          <div class="am-ft-black">终身</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">缴费期间</div>
          <div class="am-ft-black">{{mainPayYear - 1}}年交</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">保险金额</div>
          <div class="am-ft-orange">{{insurance.period_money}}</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">年缴保费</div>
          <div class="am-ft-orange">{{addonRes[item.safe_id]['年缴保费']}}</div>
        </div>
      </template>
      <!-- 附加投保人豁免保险费重大疾病保险（2017 版） -->
      <!-- 附加豁免保险费定期寿险 -->
      <template v-else-if="(item.safe_id==='285' || item.safe_id==='284') && addonRes[item.safe_id]">
        <div class="am-list-item">
          <div class="am-list-content">保障期间</div>
          <div class="am-ft-black">{{mainPayYear - 1}}年</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">缴费期间</div>
          <div class="am-ft-black">{{mainPayYear - 1}}年交</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">保险金额</div>
          <div class="am-ft-orange">{{insurance.period_money}}</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">年缴保费</div>
          <div class="am-ft-orange">{{addonRes[item.safe_id]['年缴保费']}}</div>
        </div>
      </template>
      <!-- 附加豁免保险费定期寿险 -->
      <!-- 附加投保人保费豁免重大疾病保险 -->
      <template v-else-if="item.safe_id === '281' && addonRes[item.safe_id]">
        <div class="am-list-item">
          <div class="am-list-content">保障期间</div>
          <div class="am-ft-black">{{mainPayYear}}年</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">缴费期间</div>
          <div class="am-ft-black">{{mainPayYear}}年交</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">保险金额</div>
          <div class="am-ft-orange">{{insurance.period_money}}</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">年缴保费</div>
          <div class="am-ft-orange">{{addonRes[item.safe_id]['年缴保费']}}</div>
        </div>
      </template>
      <!-- 附加投保人保费豁免重大疾病保险 -->
      <!-- 附加住院费用医疗（社保和非社保型）235-236 -->
      <template v-else-if="(item.safe_id === '235' || item.safe_id === '236' || item.safe_id === '237') && addonsSelected[item.safe_id]">
        <app-select label="投保份数">
          <select v-model.number="flag[item.safe_id]" @change="flagChanged(item.safe_id)">
            <option disabled value=''>请选择</option>
            <option value="1" v-if="(insurance.period_money > 1000 && insurance.period_money <= 1499)">1份</option>
            <option :value="n" v-else-if="(insurance.period_money > 1500 && insurance.period_money <= 2999)"
                    v-for="n in 2">{{n}}份
            </option>
            <option :value="n" v-else-if="(insurance.period_money > 3000 && insurance.period_money <= 3999)"
                    v-for="n in 3">{{n}}份
            </option>
            <option :value="n" v-else-if="(insurance.period_money > 4000 && insurance.period_money <= 4999)"
                    v-for="n in 4">{{n}}份
            </option>
            <option :value="n" v-else-if="(insurance.period_money > 4000 && item.safe_id === '237')" v-for="n in 4">{{n}}份</option>
            <option :value="n" v-else-if="(insurance.period_money > 5000 && insurance.period_money <= 5999)"
                    v-for="n in 5">{{n}}份
            </option>
            <option :value="n" v-else-if="insurance.period_money > 6000" v-for="n in 6">{{n}}份</option>
          </select>
        </app-select>
        <div class="am-list-item">
          <div class="am-list-content">保障期间</div>
          <div class="am-ft-black">1年</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">缴费期间</div>
          <div class="am-ft-black">趸交</div>
        </div>
        <div class="am-list-item" v-if="addonRes[item.safe_id]">
          <div class="am-list-content">年缴保费</div>
          <div class="am-ft-orange">{{addonRes[item.safe_id]['年缴保费']}}</div>
        </div>
      </template>
      <!-- 附加住院费用医疗（社保和非社保型）235-236 -->
      <!-- 华宝安康医疗保险 -->
      <template v-else-if="item.safe_id === '273' && addonsSelected[item.safe_id]">
        <app-select label="选择计划">
          <select v-model.number="flag[item.safe_id]" @change="flagChanged(item.safe_id)">
            <option disabled value=''>请选择计划</option>
            <option value='1'>愈安</option>
            <option value='3'>愈佳</option>
          </select>
        </app-select>
        <div class="am-list-item" v-for="(value,key) in addonRes[item.safe_id]" v-if="key !== '社保外特殊病房床位费及膳食费'">
          <div class="am-list-content">{{key}}</div>
          <div class="am-ft-orange">{{value}}</div>
        </div>
      </template>
      <!-- 华宝安康医疗保险 -->
      <!-- 附加住院津贴医疗保险 -->
      <template v-else-if="item.safe_id === '196' && addonRes[item.safe_id]">
        <div class="am-list-item" v-for="(value,key) in addonRes[item.safe_id]">
          <div class="am-list-content">{{key}}</div>
          <div class="am-ft-orange">{{value}}</div>
        </div>
      </template>
      <!-- 附加住院津贴医疗保险 -->
      <!-- 附加御立方三号重大疾病保险 -->
      <template v-else-if="item.safe_id === '177' && addonRes[item.safe_id]">
        <div class="am-list-item">
          <div class="am-list-content">年缴保费</div>
          <div class="am-ft-orange">{{addonRes[item.safe_id]['年缴保费']}}</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">轻症保险金</div>
          <div class="am-ft-orange">{{addonRes[item.safe_id]['轻症保险金']}}</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">重疾保险金</div>
          <div class="am-ft-orange">{{addonRes[item.safe_id]['重疾保险金']}}</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">现金价值</div>
          <div class="am-ft-orange">{{addonRes[item.safe_id]['现金价值']}}</div>
        </div>
      </template>
      <!-- 附加御立方三号重大疾病保险 -->
      <!-- 附加乐无忧住院医疗保险 -->
      <template v-else-if="item.safe_id === '175' && addonsSelected[item.safe_id]">
        <app-select label="保险计划">
          <select v-model.number="flag[item.safe_id]" @change="flagChanged(item.safe_id)">
            <option disabled value=''>请选择计划</option>
            <option value='1'>计划一(基本保额：1万元)</option>
            <option value='2'>计划二(基本保额：2万元)</option>
            <option value='3'>计划三(基本保额：3.5万元)</option>
            <option value='4'>计划四(基本保额：5万元)</option>
          </select>
        </app-select>
        <template v-if="addonRes[item.safe_id]">
          <div class="am-list-item">
            <div class="am-list-content">住院医疗保险金-计划{{flag[item.safe_id]}}(元)</div>
            <div class="am-ft-orange">{{addonRes[item.safe_id]['住院医疗保险金-计划' + flag[item.safe_id] + '(元)']}}</div>
          </div>
          <div class="am-list-item">
            <div class="am-list-content">自费用药费用保险金-计划{{flag[item.safe_id]}}(元) </div>
            <div class="am-ft-orange">{{addonRes[item.safe_id]['自费用药费用保险金-计划' + flag[item.safe_id] + '(元)']}}</div>
          </div>
          <div class="am-list-item">
            <div class="am-list-content">保障期间(年)</div>
            <div class="am-ft-orange">{{addonRes[item.safe_id]['保障期间(年)']}}</div>
          </div>
          <div class="am-list-item">
            <div class="am-list-content">缴费年间(年)</div>
            <div class="am-ft-orange">{{addonRes[item.safe_id]['缴费年间(年)']}}</div>
          </div>
          <div class="am-list-item">
            <div class="am-list-content">年缴保费(元)</div>
            <div class="am-ft-orange">{{addonRes[item.safe_id]['年缴保费(元)']}}</div>
          </div>
        </template>
      </template>
      <!-- 附加乐无忧住院医疗保险 -->
      <!-- 附加综合意外伤害保险 -->
      <template v-else-if="item.safe_id === '148' && addonsSelected[item.safe_id]">
        <app-input label="保险金额">
          <input slot="input"
                 v-model.number="cache.base_money148"
                 type="number"
                 placeholder="基本保险金额（元）"
                 @change="addonsSelected[item.safe_id] = true, flagChanged(item.safe_id)">
                 <!-- @change="addonRes[item.safe_id]=null,addonsSelected[item.safe_id]=false"> -->
          <div slot="icon"
               v-show="cache.base_money148 != ''"
               @click="cache.base_money148 = ''"
               class="am-list-clear">
            <i class="am-icon-clear am-icon"></i>
          </div>
          <span slot="button" class="am-ft-orange am-ft-sm">(5万~300万)</span>
        </app-input>
        <app-select label="职业分类">
          <select v-model.number="flag[item.safe_id]"
                  @change="addonsSelected[item.safe_id] = true, flagChanged(item.safe_id)">
                  <!-- @change="addonRes[item.safe_id]=null,addonsSelected[item.safe_id]=false"> -->
            <option disabled value=''>请选择职业分类</option>
            <option :value="item" v-for="item in 4">{{item}}类</option>
          </select>
        </app-select>
        <div class="am-list-item">
          <div class="am-list-content">保障期间</div>
          <div class="am-ft-black">1年</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">缴费期间</div>
          <div class="am-ft-black">趸交</div>
        </div>
        <div class="am-list-item" v-if="addonRes[item.safe_id]">
          <div class="am-list-content">年缴保费</div>
          <div class="am-ft-orange">{{addonRes[item.safe_id]['年缴保费']}}</div>
        </div>
      </template>
      <!-- 附加综合意外伤害保险 -->
      <!-- 附加住院费用医疗保险 -->
      <template v-else-if="item.safe_id === '147' && addonsSelected[item.safe_id]">
        <app-select label="保险金额">
          <select v-model.number="flag[item.safe_id]" @change="flagChanged(item.safe_id)">
            <option disabled value=''>请选择金额</option>
            <option value="2000">2000元</option>
            <option value="3000">3000元</option>
            <option value="4000">4000元</option>
            <option value="5000">5000元</option>
            <option value="6000">6000元</option>
            <option value="7000">7000元</option>
            <option value="8000">8000元</option>
            <option value="9000">9000元</option>
            <option value="10000">10000元</option>
            <option value="15000" v-show="insurance.period_money > 3000">15000元</option>
            <option value="20000" v-show="insurance.period_money > 3000">20000元</option>
            <option value="25000" v-show="insurance.period_money > 3000">25000元</option>
            <option value="30000" v-show="insurance.period_money > 3000">30000元</option>
          </select>
        </app-select>
        <div class="am-list-item">
          <div class="am-list-content">保障期间</div>
          <div class="am-ft-black">1年</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">缴费期间</div>
          <div class="am-ft-black">趸交</div>
        </div>
        <div class="am-list-item" v-if="addonRes[item.safe_id]">
          <div class="am-list-content">年缴保费</div>
          <div class="am-ft-orange">{{addonRes[item.safe_id]['年缴保费']}}</div>
        </div>
      </template>
      <!-- 附加住院费用医疗保险 -->
      <!-- 附加意外伤害医疗B -->
      <template v-else-if="item.safe_id === '146' && addonsSelected[item.safe_id]">
        <app-select label="保险金额">
          <select v-model.number="flag[item.safe_id]" @change="flagChanged(item.safe_id)">
            <option disabled value=''>请选择金额</option>
            <option value="2000">2000元</option>
            <option value="3000">3000元</option>
            <option value="4000">4000元</option>
            <option value="5000">5000元</option>
            <option value="6000">6000元</option>
            <option value="7000">7000元</option>
            <option value="8000">8000元</option>
            <option value="9000">9000元</option>
            <option value="10000">10000元</option>
            <option value="15000">15000元</option>
            <option value="20000">20000元</option>
          </select>
        </app-select>
        <div class="am-list-item">
          <div class="am-list-content">保障期间</div>
          <div class="am-ft-black">1年</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">缴费期间</div>
          <div class="am-ft-black">趸交</div>
        </div>
        <div class="am-list-item" v-if="addonRes[item.safe_id]">
          <div class="am-list-content">年缴保费</div>
          <div class="am-ft-orange">{{addonRes[item.safe_id]['年缴保费']}}</div>
        </div>
      </template>
      <!-- 附加意外伤害医疗B -->
      <!-- 附加乐相伴豁免保险费重大疾病保险 -->
      <template v-else-if="item.safe_id === '131' && addonRes[item.safe_id]">
        <div class="am-list-item">
          <div class="am-list-content">保障期间</div>
          <div class="am-ft-black">{{mainPayYear > 1 ? mainPayYear - 1 : mainPayYear}}年</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">缴费期间</div>
          <div class="am-ft-black">{{mainPayYear > 1 ? (mainPayYear - 1) + '年交' : '趸交'}}</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">保险金额</div>
          <div class="am-ft-orange">{{insurance.period_money}}</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">年缴保费</div>
          <div class="am-ft-orange">{{addonRes[item.safe_id]['年缴保费(元)']}}</div>
        </div>
      </template>
      <!-- 附加乐相伴豁免保险费重大疾病保险 -->
      <!-- 附加如意尊享住院费用B款医疗保险 -->
      <template v-else-if="item.safe_id === '121' && addonRes[item.safe_id]">
        <div class="am-list-item" v-for="value,key in addonRes[item.safe_id]">
          <div class="am-list-content">{{key}}</div>
          <div class="am-ft-orange">{{value}}</div>
        </div>
      </template>
      <!-- 附加如意尊享住院费用B款医疗保险 -->
      <!-- 国华附加年金保险 -->
      <template v-else-if="item.safe_id === '94' && addonRes[item.safe_id]">
        <div class="am-list-item">
          <div class="am-list-content">保障期间</div>
          <div class="am-ft-black">至85岁</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">缴费期间</div>
          <div class="am-ft-black">{{mainPayYear}}年交</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">保险金额</div>
          <div class="am-ft-orange">{{insurance.period_money * mainPayYear}}</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">年缴保费</div>
          <div class="am-ft-orange">{{addonRes[item.safe_id]['年缴保费']}}</div>
        </div>
      </template>
      <!-- 国华附加年金保险 -->
      <!-- 附加豁免保险费重疾保险 -->
      <template v-else-if="item.safe_id === '86' && addonRes[item.safe_id]">
        <div class="am-list-item">
          <div class="am-list-content">保障期间</div>
          <div class="am-ft-black">{{(mainPayYear - 1) + '年'}}</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">缴费期间</div>
          <div class="am-ft-black">{{(mainPayYear - 1) + '年交'}}</div>
        </div>
        <div class="am-list-item">
          <div class="am-list-content">年缴保费</div>
          <div class="am-ft-orange">{{addonRes[item.safe_id]['年缴保费']}}</div>
        </div>
      </template>
      <!-- 附加豁免保险费重疾保险 -->
    </app-dropdown>
  </div>
</template>
<script>
  /**
   * 险种
   * @vue
   */
  import utils from '../widgets/utils'
  import qs from 'qs'

  import {
    mapState,
    mapGetters
  } from 'vuex'

  const calMoneyIns = ['74', '182', '290', '352', '360'] // 算保费的主险
  const fuMoneyIns = ['318'] // 通过附加算主险
  // 附加险上线产品
  const addonFilter = ['8', '11', '86', '94', '121', '131', '146', '147', '148', '175', '177', '196', '235', '236', '237', '273', '281', '284', '285', '289', '291', '293', '294', '295', '348']
  const mustSelected = ['291', '177', '11', '333', '332', '349', '354'] // 必须附加的附加险
  const noNeedCal = ['291', '11', '349'] // 不需要计算的险种
  const directNeedCal = ['11', '94', '121', '131', '177', '196', '284', '281', '285', '289', '333', '367', '368'] // 直接 计算的险种

  export default {
    name: 'insurance',
    props: {
      id: Number,
      insIndex: Number,
      edit: Object
    },
    data () {
      return {
        plan_name: '',
        showAll: true,
        editLoaded: false, // 编辑状态
        sc_id: '',
        insurance: { // 主险投保信息
          safe_id: '',
          safe_year: '',
          pay_year: '',
          money: '', // 基本保险金额
          period_money: '' // 年交保费
        },
        mainInsurance: '',
        mainSyAttr: [],
        mainPyAttr: [],
        mainPayYear: '',
        mainSafeYear: '',
        prospectus_types: [], // 计划类型
        prospectus_type: '', // 选择的计划类型
        flag: {}, // 试算特殊参数
        cache: { // 数据缓存
          base_money148: '',
          base_money295: '',
          quota147: '',
          derate_money291: '',
          derate_money349: '',
          derate_money354: '',
          pay_money332: '',
          pay_money333: ''
        },
        mainInsData: {}, // 主险提交信息
        addonInsData: {}, // 附加险提交信息

        addonsSelected: {}, // 附加险投保状态
        showAddonIns: [], // 附加险信息
        addonFilter: addonFilter, // 附加险过滤
        addonRes: {}, // 附加险返回信息

        samePerson: false, // 投被保人为同人
        isBaseMoney: true, // 输入保额
        fuBaseMoney: false, // 附加险算主险
        fxljys366: {  // 复星乐健一生
          shebao: 'B',
          zytc: '0', // 住院套餐
          zynmp: '0', // 住院年免赔
          zyzfbl: 1, // 住院自负比例
          mz: false, // 是否选择门诊
          mznmp: '0', // 门诊年免赔
          mzptcmp: 1, // 门诊普通次免赔
          mztxcimp: 1, // 门诊特需次免赔
          mztc: '0', // 门诊套餐
          mzzfbl: 1 // 门诊自负比例
        }
      }
    },
    computed: {
      ...mapState([
        'admin_id',
        'pl_id',
        'appl',
        'insList'
        // 'assuchange' // 被保险人是否改变
      ]),
      ...mapGetters([
        'assu',
        'ins'
      ]),
      assuchange () {
        return this.$store.state.assuchange[this.id]
      },
      Addons () { // 附加险可选信息
        let Addons = {}
        if (!this.insurance.safe_id || !this.insList || !this.insList.children) {
          return Addons
        }
        let children = this.insList.children[this.insurance.safe_id]
        children && children.forEach(item => {
          Addons[item.safe_id] = utils.parseVueObj(item)
        })
        return Addons
      }
    },
    watch: {
      assuchange (val) {
        this.insurance.period_money = ''
      }
    },
    methods: {
      delIns () {
        let length = 0
        this.ins.forEach(item => {
          if (item) length++
        })
        if (length === 1) {
          this.$toast.open('本方案的最后一个险种，不能删除')
          return false
        }

        this.$dialog.open('确认删除该险种吗？', () => {
          console.info('delIns: ', this.insIndex)
          this.$store.commit('RMV_INS', this.insIndex)
          this.$parent.$forceUpdate()
          this.$nextTick(() => {
            this.$parent.countMoney()
          })
        }, this.mainInsurance.name)
      },
      toggle () {
        this.showAll = !this.showAll
        this.$store.commit('CHG_PLAN_STATUS', false)
        this.$parent.$forceUpdate() // 强制更新 app 组件状态
      },
      // 校验关系
      checkRS () {
        console.info('checkRS')
        if (this.appl.name === this.assu.name &&
          this.appl.sex === this.assu.sex &&
          this.appl.age === this.assu.age) {
          // 3要素相同
          this.samePerson = true
          console.log('被保险人和投保人为同一人')
        } else {
          this.samePerson = false
        }
      },
      /**
       * 主险
       */
      companyChanged () {
        this.mainInsurance = ''
        this.insurance = {
          safe_id: '',
          safe_year: '',
          pay_year: '',
          money: '',
          period_money: ''
        }
        this.prospectus_type = ''
      },
      // 更改险种
      insChanged () {
        const safeid = this.mainInsurance.safe_id
        if (!safeid) return
        this.insurance.safe_id = safeid
        const mainIns = this.mainInsurance
        this.plan_name = mainIns.name

        // 保险期间
        let mainSyAttr = utils.unique(mainIns.attr, 'safe_year') // 去重
        mainSyAttr = mainSyAttr.sort((a, b) => a.safe_year - b.safe_year) // 排序
        this.mainSyAttr = mainSyAttr

        if (mainSyAttr.length === 1) {
          this.insurance.safe_year = mainSyAttr[0].safe_year
        } else {
          this.insurance.safe_year = ''
        }

        // 缴费年限
        let mainPyAttr = utils.unique(mainIns.attr, 'pay_year') // 去重
        mainPyAttr = mainPyAttr.sort((a, b) => a.pay_year - b.pay_year) // 排序
        this.mainPyAttr = mainPyAttr

        if (mainPyAttr.length === 1) {
          this.insurance.pay_year = mainPyAttr[0].pay_year
        } else {
          this.insurance.pay_year = ''
        }
        // 计划类型
        switch (safeid) {
          case '74':
            this.prospectus_types = [{
              value: 'educate',
              name: '领取版'
            }, {
              value: 'asset',
              name: '财富传承'
            }]
            break
          case '172':
            this.prospectus_types = [{
              value: 'educate',
              name: '领取版'
            }, {
              value: 'asset',
              name: '财富传承'
            }]
            break
          case '280':
            this.prospectus_types = [{
              value: '100',
              name: '有社保100万'
            }, {
              value: '300',
              name: '有社保300万'
            }, {
              value: '1100',
              name: '无社保100万'
            }, {
              value: '1300',
              name: '无社保300万'
            }]
            break
          case '309':
            this.prospectus_types = [{
              value: '1',
              name: '计划一'
            }, {
              value: '2',
              name: '计划二'
            }, {
              value: '3',
              name: '计划三'
            }]
            break
          default:
            this.prospectus_types = []
            break
        }

        if (safeid === '205' || safeid === '352') { // 泰康尊享岁月  中国人保尊赢
          this.flag[safeid] = '' // 领取年龄
        }

        // 保费、保额
        if (safeid === '280' || safeid === '309') { // 平安e生保，安联无忧
          this.insurance.money = 1
        } else {
          this.insurance.money = ''
        }
        this.insurance.period_money = ''

        // 部分险种输入 保额， 算保费
        this.isBaseMoney = calMoneyIns.indexOf(safeid) === -1
        this.fuBaseMoney = fuMoneyIns.indexOf(safeid) !== -1
        this.resetAddon()
        if (this.pl_id && this.edit.main && !this.editLoaded) {
          let main = this.edit.main
          let money = ''
          let periodMoney = ''
          switch (safeid) {
            case '292':
              money = main.base_money / 50000
              break
            case '290':
              periodMoney = main.year_fee
              break
            default:
              periodMoney = main.year_fee
              money = main.base_money
              break
          }
          this.insurance.safe_year = Number(main.safe_year)
          this.insurance.pay_year = Number(main.pay_year)
          this.insurance.money = money // 基本保险金额
          this.insurance.period_money = periodMoney // 年交保费
          this.$forceUpdate()
          this.editLoaded = true
        }
        this.fxljys366 = {  // 复星乐健一生
          shebao: 'B',
          zytc: '0', // 住院套餐
          zynmp: '0', // 住院年免赔
          zyzfbl: 1, // 住院自负比例
          mz: false, // 是否选择门诊
          mznmp: '0', // 门诊年免赔
          mzptcmp: 1, // 门诊普通次免赔
          mztxcimp: 1, // 门诊特需次免赔
          mztc: '0', // 门诊套餐
          mzzfbl: 1 // 门诊自负比例
        }
      },
      // 重置主险费用及附加险
      resetFee (fx) {
        if (fx !== 'fxmz') { // 如果是复星门诊不清空
          this.isBaseMoney ? this.insurance.period_money = '' : this.insurance.money = ''
        } else {
          this.fxljys366.mzmoney = ''
        }
        if (fx === 'fxsb') { // 切换社保，2个都重置
          this.fxljys366.zymoney = ''
          this.fxljys366.mzmoney = ''
        }
        if (this.fuBaseMoney) { // 如果是乐行天下
          this.insurance.period_money = ''
          this.insurance.money = ''
        }
        if (this.insurance.safe_id !== '366') { // 复星乐健一生不重置附加险
          this.resetAddon()
        }
      },
      /**
       * 附加险
       * @param index
       * @returns {boolean}
       */
      // 更改附加险状态
      chAddonState (index) {
        if (this.uploading) {
          this.addonsSelected[index] = !this.addonsSelected[index]
          this.$forceUpdate()
          return false
        }
        console.log(this.addonsSelected[index])
        this.checkRS()
        let toastText = null
        if (this.addonsSelected[index]) {
          // 主险保费校验不合格
          if (!this.checkMainFee(this.insurance.safe_id)) {
            this.addonsSelected[index] = false
            this.$forceUpdate()
            return false
          }
          // let flag = this.flag[index]
          let periodMoney = this.insurance.period_money

          switch (this.insurance.safe_id) {
            case '288':
              if (['295', '294', '293'].indexOf(index) > -1) {
                if (this.insurance.money < 200000) {
                  toastText = '主险保额小于20万元时不可附加该险种'
                }
              }
              break
            case '290':
              if (['295', '294', '293'].indexOf(index) > -1) {
                if (this.insurance.pay_year === 10 && this.insurance.period_money < 10000) {
                  toastText = '主险缴费期为 10年，且期交保费 1 万及以上方可附加'
                } else if (this.insurance.period_money < 20000 && [3, 5].indexOf(this.insurance.pay_year) === -1) {
                  toastText = '主险缴费期为 3 年、5 年，且期交保费 2 万及以上方可附加'
                }
              }
              break
            case '292':
              if (['295', '294', '293'].indexOf(index) > -1) {
                if (this.insurance.money * 50000 < 200000) {
                  toastText = '主险保额小于20万元时不可附加该险种'
                }
              }
              break
            case '369': // 恒大万年青
              if (['293'].indexOf(index) > -1) {
                if (this.insurance.money < 50000) {
                  toastText = '主险保额小于5万元时不可附加该险种'
                } else if (this.insurance.period_money < 3000) {
                  toastText = '期交保费小于3千元时不可附加该险种'
                }
              }
              break
            default:
              break
          }
          switch (index) {
            case '368': // 附加康乐一生轻症保险
              this.addonsSelected[367] = false
              this.addonRes[367] = ''
              this.$forceUpdate()
              break
            case '367': // 附加康乐一生投保人豁免保费重大疾病保险
              if (this.samePerson) {
                toastText = '投被保人为同人时不可附加该险种'
              } else if (this.mainPayYear === 1) {
                toastText = '主险趸交不可附加该险种'
              }
              break
            case '281':
              if (this.samePerson) {
                toastText = '投被保人为同人时不可附加该险种'
              } else if (this.mainPayYear === 1) {
                toastText = '主险趸交不可附加该险种'
              }
              break
            case '196':
              if (periodMoney < 1000) {
                toastText = '主险年交保费小于1000元不可附加该险种'
              }
              break
            case '147':
              if (periodMoney < 1000) {
                toastText = '主险年交保费小于1000元不可附加该险种'
              }
              break
            case '131':
              if (!periodMoney) {
                toastText = '请先完善其他附加险，算出主险年缴保费'
              }
              if (this.samePerson) {
                toastText = '投被保人为同人时不可附加该险种'
              }
              if (this.mainPayYear === 1) {
                toastText = '主险趸交不可附加该险种'
              }
              break
            case '86': // 附加豁免保险费重疾保险
            case '289':
            case '285': // 附加豁免保险费重大疾病保险
            case '284': // 附加豁免保险费定期寿险
              if (this.samePerson) {
                toastText = '投被保人为同人时不可附加该险种'
              }
              break
            case '121':
              if (periodMoney < 3000) {
                toastText = '主险年交保费小于3000元不可附加该险种'
              }
              break
            case '235': // 附加住院费用医疗（非社保型）
              if (this.addonsSelected[236]) {
                toastText = '社保与非社保只能选择一个'
              }
              break
            case '236': // 附加住院费用医疗（社保型）
              if (this.addonsSelected[235]) {
                toastText = '社保与非社保只能选择一个'
              }
              break
          }
          if (toastText) {
            this.$toast.open(toastText)
            this.addonsSelected[index] = false
            this.$forceUpdate()
          } else if (directNeedCal.indexOf(index) > -1) { // 直接计算
            this.calMoney(false, index) // 试算附加险
          }
        } else {
          if (mustSelected.indexOf(index) > -1) {
            toastText = '该附加险必须附加，不能取消'
            this.$toast.open(toastText)
            this.addonsSelected[index] = true
            this.calMoney(false, index)// 试算附加险
          } else {
//            取消时 清除缓存的提交数据
            this.flag[index] = ''
            this.$delete(this.addonInsData, index)
            this.$delete(this.addonRes, index)
          }
          this.$forceUpdate()
        }
      },
      // 重置附加险默认信息
      resetAddon () {
        let safeid = this.insurance.safe_id
        if (safeid === '361') {
          this.flag[362] = ''
        } else if (safeid === '318') {
          this.flag[332] = ''
        } else if (safeid === '288' || safeid === '290' || safeid === '292' || safeid === '369') { // 新增恒大万年青终身重疾病保险
          this.flag[294] = ''
          this.flag[293] = ''
        } else if (safeid === '283') {
          this.flag[146] = ''
          this.flag[147] = ''
          this.cache.quota147 = 2
          this.flag[148] = ''
          this.cache.base_money148 = 0
        } else if (safeid === '272') {
          this.flag[273] = ''
        } else if (safeid === '130') {
          this.flag[175] = ''
        } else if (safeid === '165' || safeid === '319') {
          this.flag[235] = ''
          this.flag[236] = ''
          this.flag[237] = ''
        }
        this.cache.base_money295 = ''
        this.cache.derate_money291 = ''
        this.cache.pay_money332 = ''
        this.cache.pay_money333 = ''
        if (this.Addons) {
          for (let i in this.Addons[safeid]) {
            const j = this.Addons[safeid][i].safe_id
            this.addonsSelected[j] = false
          }
        }
        this.addonRes = {}
        if (safeid === '74') {
          this.addonsSelected = {
            11: true
          }
        } else if (safeid === '290') {
          this.addonsSelected = {
            291: true
          }
        } else if (safeid === '172') {
          this.addonsSelected = {
            349: true
          }
        } else {
          this.addonsSelected = {}
        }
      },
      // 更新附加险Flag
      flagChanged (index) {
        this.addonRes[index] = null
        // this.addonsSelected[index] = false
        this.calMoney(false, index) // 试算附加险
        // this.$forceUpdate()
      },
      /**
       * 数据校验
       */
      // 校验投保人
      checkAppl () {
        let toastText = null
        if (!this.checkName(this.appl.name, '投保人')) {
          return false
        } else if (!this.appl.age) {
          toastText = '投保人年龄不能为空'
        } else if (this.appl.age < 18) {
          toastText = '投保人年龄不能小于18周岁'
        } else if (this.appl.age > 100) {
          toastText = '投保人年龄不能大于100周岁'
        }
        if (toastText) {
          this.$toast.open(toastText)
          return false
        }
        return true
      },
      // 校验被保险人
      checkAssu () {
        let toastText = null
        if (!this.checkName(this.assu.name, '被投保人')) {
          return false
        } else if (this.assu.age === '') { // 被保人输入零让他可以投保
          toastText = '被投保人年龄不能为空'
        }
        if (toastText) {
          this.$toast.open(toastText)
          return false
        }
        return true
      },
      // 校验主险
      checkMainForm () {
        const safeid = this.insurance.safe_id
        let toastText = null
        let exp = /^(([1-9]\d{0,12})|0)(\.\d{1,2})?$/
        if (!this.checkAppl()) {
          return false
        }
        if (!this.checkAssu()) {
          return false
        }
        if (this.sc_id === '0') {
          toastText = '请选择公司'
        } else if (!this.insurance.safe_id) {
          toastText = '请选择主险'
        } else if (!this.insurance.safe_year) {
          toastText = '请选择主险保险期间'
        } else if (!this.insurance.pay_year) {
          toastText = '请选择主险交费期间'
        } else if (safeid === '292' && !this.insurance.money) {
          toastText = '请选择投保份数'
        } else if (safeid === '205' && !this.flag[safeid]) {
          toastText = '请选择主险领取年龄'
        } else if (safeid === '352' && !this.flag[safeid]) {
          toastText = '请选择主险领取年龄'
        } else if (this.isBaseMoney && !this.insurance.money && !this.fuBaseMoney && this.insurance.safe_id !== '366') {
          toastText = '请输入主险基本保额'
        } else if (this.isBaseMoney && exp.test(this.insurance.money) === false && !this.fuBaseMoney && this.insurance.safe_id !== '366') {
          toastText = '数字格式不规范，请重新输入'
        } else if (!this.isBaseMoney && !this.insurance.period_money && !this.fuBaseMoney) {
          toastText = '请输入主险年缴保费'
        } else if (this.isBaseMoney && !this.insurance.period_money && this.fuBaseMoney && this.cache.pay_money332 === '') {
          toastText = '请先完善附加乐行天下意外伤害保险'
        } else if (this.isBaseMoney && !this.insurance.period_money && this.fuBaseMoney && this.cache.pay_money333 === '') {
          toastText = '请先完善附加乐行天下意外住院津贴医疗保险'
        } else if (this.prospectus_types.length > 0 && !this.prospectus_type) {
          toastText = '请选择计划类型'
        } else if (this.insurance.safe_id === '366' && this.fxljys366.zytc === '0') {
          toastText = '请选择乐健一生住院套餐'
        } else if (this.insurance.safe_id === '366' && this.fxljys366.zynmp === '0') {
          toastText = '请选择乐健一生住院免赔额'
        }
        if (toastText) {
          this.$toast.open(toastText)
          return false
        }
        return true
      },
      // 校验主险投保年龄
      checkMainAge (safeid) {
        let applAge = this.appl.age
        let assuAge = this.assu.age
        let mainSafeYear = this.mainSafeYear
        let mainPayYear = this.mainPayYear
        let payOverage = mainPayYear + assuAge // 缴费期满年龄

        let toastText = null
        switch (safeid) {
          case '369': // 恒大万年青终身重疾病保险
            if (mainPayYear === 10 && assuAge > 60) {
              toastText = '10年交被保人年龄不能大于60周岁'
            } else if (mainPayYear === 15 && assuAge > 55) {
              toastText = '20年交被保人年龄不能大于55周岁'
            } else if (mainPayYear === 20 && assuAge > 50) {
              toastText = '20年交被保人年龄不能大于50周岁'
            } else if (mainPayYear === 30 && assuAge > 40) {
              toastText = '30年交被保人年龄不能大于40周岁'
            }
            break
          case '366': // 复星乐健一生
            if (assuAge > 64) {
              toastText = '被保人年龄不能大于64周岁'
            }
            break
          case '364': // 康乐一生重大疾病保险A款
          case '365': // 康乐一生重大疾病保险B款
            if (mainPayYear === 1 && applAge > 70) {
              toastText = '投保人年龄不能大于70周岁'
            } else if (mainPayYear === 5 && applAge > 65) {
              toastText = '5年交投保人年龄不能大于65周岁'
            } else if (mainPayYear === 10 && applAge > 60) {
              toastText = '10年交投保人年龄不能大于60周岁'
            } else if (mainPayYear === 20 && applAge > 50) {
              toastText = '20年交投保人年龄不能大于50周岁'
            } else if (assuAge > 50) {
              toastText = '被保人年龄不能大于50周岁'
            }
            if (mainPayYear === 20 && mainSafeYear === 70) {
              toastText = '保障期间为70年时不能20年交'
            }
            break
          case '363': // 泰康乐安心
            if (assuAge > 60) {
              toastText = '被保人年龄不能大于60周岁'
            } else if (payOverage > 70) {
              toastText = '缴费期满年龄不能大于70周岁'
            }
            break
          case '361': // 信泰百万健康重大疾病
            if (mainPayYear === 1 && assuAge > 60) {
              toastText = '被保人年龄不能大于60周岁'
            } else if (mainPayYear === 3 && assuAge > 60) {
              toastText = '3年交被保人年龄不能大于60周岁'
            } else if (mainPayYear === 5 && assuAge > 60) {
              toastText = '5年交被保人年龄不能大于60周岁'
            } else if (mainPayYear === 10 && assuAge > 60) {
              toastText = '10年交被保人年龄不能大于60周岁'
            } else if (mainPayYear === 15 && assuAge > 55) {
              toastText = '15年交被保人年龄不能大于55周岁'
            } else if (mainPayYear === 20 && assuAge > 50) {
              toastText = '20年交被保人年龄不能大于50周岁'
            } else if (mainPayYear === 30 && assuAge > 40) {
              toastText = '30年交被保人年龄不能大于40周岁'
            }
            break
          case '360': // 恒大鑫福年
            if (assuAge > 54) {
              toastText = '被保人年龄不能大于54周岁'
            } else if (assuAge < 1) {
              toastText = '被保人年龄不能小于28天'
            }
            break
          case '352': // 附加品质生活年金保险
            if (mainPayYear === 1 && assuAge > 70 && this.flag[safeid] === 80) {
              toastText = '领取年龄为80岁且为1年交，被保人年龄不能大于70周岁'
            } else if (mainPayYear === 3 && assuAge > 67 && this.flag[safeid] === 80) {
              toastText = '领取年龄为80岁且为3年交，被保人年龄不能大于67周岁'
            } else if (mainPayYear === 5 && assuAge > 65 && this.flag[safeid] === 80) {
              toastText = '领取年龄为80岁且为5年交，被保人年龄不能大于65周岁'
            } else if (mainPayYear === 10 && assuAge > 60 && this.flag[safeid] === 80) {
              toastText = '领取年龄为80岁且为10年交，被保人年龄不能大于60周岁'
            } else if (mainPayYear === 1 && assuAge > 50 && this.flag[safeid] === 60) {
              toastText = '领取年龄为60岁且为1年交，被保人年龄不能大于50周岁'
            } else if (mainPayYear === 3 && assuAge > 47 && this.flag[safeid] === 60) {
              toastText = '领取年龄为60岁且为3年交，被保险人年龄不能大于47周岁'
            } else if (mainPayYear === 5 && assuAge > 45 && this.flag[safeid] === 60) {
              toastText = '领取年龄为60岁且为5年交，被保险人年龄不能大于45周岁'
            } else if (mainPayYear === 10 && assuAge > 40 && this.flag[safeid] === 60) {
              toastText = '领取年龄为60岁且为10年交，被保险人年龄不能大于40周岁'
            }
            break
          case '348': // 泰康乐赢家
            if (mainPayYear === 1 && assuAge > 63) {
              toastText = '被保人年龄不能大于63周岁'
            } else if (mainPayYear === 3 && assuAge > 60) {
              toastText = '3年交被保人年龄不能大于60周岁'
            } else if (mainPayYear === 5 && assuAge > 60) {
              toastText = '5年交被保人年龄不能大于60周岁'
            } else if (mainPayYear === 10 && assuAge > 55) {
              toastText = '10年交被保人年龄不能大于55周岁'
            } else if (mainPayYear === 15 && assuAge > 54) {
              toastText = '15年交被保人年龄不能大于54周岁'
            } else if (mainPayYear === 20 && assuAge > 50) {
              toastText = '20年交被保人年龄不能大于50周岁'
            }
            break
          case '316': // 华宝安行
            if (assuAge > 50) {
              toastText = '被保人年龄不能大于50周岁'
            } else if (assuAge < 18) {
              toastText = '被保人年龄不能小于18周岁'
            }
            break
          case '313': // 爱驾宝两全保险(2017)
            if (assuAge > 60) {
              toastText = '被保人年龄不能大于60周岁'
            } else if (assuAge < 18) {
              toastText = '被保人年龄不能小于18周岁'
            } else if (assuAge > 50 && mainSafeYear === 30) {
              toastText = '被保人大于50周岁时,只能选择20年交'
            }
            break
          case '309': // 安联-出行无忧
            if (assuAge < 18) {
              toastText = '被保人年龄不能小于18周岁'
            }
            break
          case '292': // 千万护航两全保险
            if (assuAge < 18 || assuAge > 55) {
              toastText = '被保人年龄范围应在18-55周岁'
            }
            break
          case '290': // 金财人生终身年金保险D款
            if (mainPayYear === 1 && assuAge > 59) {
              toastText = '趸交投保年龄上限为59岁'
            } else if ([3, 5].indexOf(this.mainPayYear) > -1 && assuAge > 55) {
              toastText = mainPayYear + '年交投保年龄上限为55岁'
            } else if (mainPayYear === 10 && assuAge > 50) {
              toastText = '10年交投保年龄上限为50岁'
            }
            break
          case '288': // 恒久健康终身重大疾病保险2017
            if ([1, 3, 5, 10].indexOf(mainPayYear) > -1 && assuAge > 65) {
              toastText = (mainPayYear === 1 ? '趸交' : mainPayYear + '年交') + '投保年龄上限为65岁'
            } else if (mainPayYear === 15 && assuAge > 60) {
              toastText = '15年交投保年龄上限为60岁'
            } else if (mainPayYear === 20 && assuAge > 55) {
              toastText = '20年交投保年龄上限为55岁'
            }
            break
          case '283': // 御享人生重大疾病保险
            if (mainPayYear === 5 && assuAge > 60) {
              toastText = '被保人年龄不能大于60周岁'
            } else if (mainPayYear === 10 && assuAge > 55) {
              toastText = '被保人年龄不能大于55周岁'
            } else if (mainPayYear === 15 && assuAge > 50) {
              toastText = '被保人年龄不能大于50周岁'
            } else if (mainPayYear === 20 && assuAge > 50) {
              toastText = '被保人年龄不能大于50周岁'
            } else if (mainPayYear === 30 && assuAge > 35) {
              toastText = '被保人年龄不能大于35周岁'
            }
            break
          case '280': // 平安e生保
            if (assuAge > 60) {
              toastText = '被保人年龄不能大于60周岁'
            }
            break
          case '272': // 盛世年年C款年金保险
            if (assuAge > 60) {
              toastText = '被保人年龄不能大于60周岁'
            }
            break
          case '209': // 信泰人寿：健康100
            if (assuAge > 60) {
              toastText = '被保人年龄不能大于60周岁'
            }
            break
          case '210': // 信泰人寿：健康100(铂金版)
            if (assuAge > 50) {
              toastText = '被保人年龄不能大于50周岁'
            }
            break
          case '205': // 尊享岁月
            if (assuAge > 65) {
              toastText = '被保人年龄不能大于65周岁'
            } else if (payOverage > this.flag[safeid]) {
              toastText = '交费期满被保人年龄不能超过开始领取年龄'
            }
            break
          case '172': // 鑫丰年年
            if (mainPayYear === 1 && assuAge > 60) {
              toastText = '被保人年龄不能大于60周岁'
            } else if (mainPayYear === 3 && assuAge > 60) {
              toastText = '3年交被保人年龄不能大于60周岁'
            } else if (mainPayYear === 5 && assuAge > 55) {
              toastText = '5年交被保人年龄不能大于55周岁'
            } else if (mainPayYear === 10 && assuAge > 50) {
              toastText = '10年交被保人年龄不能大于50周岁'
            }
            break
          case '319': // 爱加倍
          case '165': // 爱相随-尊享版
            if (assuAge > 50 && mainPayYear > 10) {
              toastText = '被保人年龄不能大于50周岁'
            } else if (assuAge > 55 && mainPayYear === 10) {
              toastText = '被保人年龄不能大于55周岁'
            } else if (assuAge > 60 && mainPayYear < 10) {
              toastText = '被保人年龄不能大于60周岁'
            }
            break
          case '130': // 乐安康
            if (assuAge > 50 && mainPayYear > 10) {
              toastText = '被保人年龄不能大于50周岁'
            } else if (assuAge > 55 && mainPayYear === 10) {
              toastText = '被保人年龄不能大于55周岁'
            } else if (assuAge > 60 && mainPayYear < 10) {
              toastText = '被保人年龄不能大于60周岁'
            }
            break
          case '74': // 盛世年年
            if (mainPayYear === 1 && assuAge > 60) {
              toastText = '被保人年龄不能大于60周岁'
            } else if (mainPayYear === 3 && assuAge > 55) {
              toastText = '3年交被保人年龄不能大于60周岁'
            } else if (mainPayYear === 5 && assuAge > 55) {
              toastText = '5年交被保人年龄不能大于55周岁'
            } else if (mainPayYear === 8 && assuAge > 50) {
              toastText = '8年交被保人年龄不能大于50周岁'
            } else if (mainPayYear === 10 && assuAge > 50) {
              toastText = '10年交被保人年龄不能大于50周岁'
            } else if (payOverage > 60) {
              toastText = '被保人交费期满不能大于60岁'
            }
            break
          case '86':
            if (assuAge > 55) {
              toastText = '被保人年龄不能大于55周岁'
            }
            break
          case '8': // 御立方三号两全保险
            if (mainSafeYear === 66) {
              if (mainPayYear === 3 && assuAge > 50) {
                toastText = '3年交保障至66周岁时被保人年龄不能大于50周岁'
              } else if (mainPayYear === 5 && assuAge > 50) {
                toastText = '5年交保障至66周岁时被保人年龄不能大于50周岁'
              } else if (mainPayYear === 10 && assuAge > 45) {
                toastText = '10年交保障至66周岁时被保人年龄不能大于45周岁'
              } else if (mainPayYear === 20 && assuAge > 40) {
                toastText = '20年交保障至66周岁时被保人年龄不能大于40周岁'
              } else if (mainPayYear === 30 && assuAge > 30) {
                toastText = '30年交保障至66周岁时被保人年龄不能大于30周岁'
              }
            } else if (mainSafeYear === 77) {
              if (mainPayYear === 3 && assuAge > 55) {
                toastText = '3年交保障至77周岁被保人年龄不能大于55周岁'
              } else if (mainPayYear === 5 && assuAge > 55) {
                toastText = '5年交保障至77周岁被保人年龄不能大于55周岁'
              } else if (mainPayYear === 10 && assuAge > 50) {
                toastText = '10年交保障至77周岁被保人年龄不能大于50周岁'
              } else if (mainPayYear === 20 && assuAge > 45) {
                toastText = '20年交保障至77周岁被保人年龄不能大于45周岁'
              } else if (mainPayYear === 30 && assuAge > 35) {
                toastText = '30年交保障至77周岁被保人年龄不能大于35周岁'
              }
            } else if (mainSafeYear === 88) {
              if (mainPayYear === 3 && assuAge > 60) {
                toastText = '3年交保障至88周岁时被保人年龄不能大于60周岁'
              } else if (mainPayYear === 5 && assuAge > 60) {
                toastText = '5年交保障至88周岁时被保人年龄不能大于60周岁'
              } else if (mainPayYear === 10 && assuAge > 55) {
                toastText = '10年交保障至88周岁时被保人年龄不能大于55周岁'
              } else if (mainPayYear === 20 && assuAge > 45) {
                toastText = '20年交保障至88周岁时被保人年龄不能大于45周岁'
              } else if (mainPayYear === 30 && assuAge > 35) {
                toastText = '30年交保障至88周岁时被保人年龄不能大于35周岁'
              }
            }
            break
        }

        if (toastText) {
          this.$toast.open('【' + this.mainInsurance.name + '】' + toastText)
          return false
        }
        return true
      },
      // 主险保额校验
      checkMainMoney (safeid) {
        let money = this.insurance.money
        let periodMoney = this.insurance.period_money
        let assuAge = Number(this.assu.age)
        let name = this.mainInsurance.name
        let toastText = null

        switch (safeid) {
          case '369': // 恒大万年青终身重疾病保险
            if (money < 50000 || money % 1000 !== 0) {
              toastText = '【' + name + '】最低保额5万元，且为1千元整数倍！'
            }
            break
          case '364': // 康乐一生重大疾病保险A款
          case '365': // 康乐一生重大疾病保险B款
            if (money > 200000 && assuAge < 2) {
              toastText = '【' + name + '】未满2周岁，投保限额为20万！'
            } else if (money > 500000 && assuAge > 2 && assuAge < 19) {
              toastText = '【' + name + '】2 周岁‐18 周岁，投保限额为50万！'
            } else if (money < 50000) {
              toastText = '【' + name + '】最低保额5万元！'
            }
            break
          case '363': // 泰康乐安心
            if (money < 50000 || money % 10000 !== 0) {
              toastText = '【' + name + '】最低保额5万元，且为1万元整数倍！'
            }
            break
          case '361': // 信泰百万健康重大疾病
            if (money < 50000 || money % 1000 !== 0) {
              toastText = '【' + name + '】最低保额5万元，且为1千元整数倍！'
            }
            break
          case '348': // 泰康乐赢家
            if (money < 200000 || money % 10000 !== 0) {
              toastText = '【' + name + '】最低保额20万元，且为1万元整数倍！'
            }
            break
          case '319': // 爱加倍
            if (this.mainPayYear === 19) {
              if (money < 100000 || money % 10000 !== 0) {
                toastText = '【' + name + '】19年交最低保额10万元，且为1万元整数倍！'
              }
            } else if (money < 20000 || money % 10000 !== 0) {
              toastText = '【' + name + '】保额最低2万元，且为1万元整数倍'
            }
            break
          case '316': // 华宝安行
            if (money < 50000 || money % 50000 !== 0) {
              toastText = '【' + name + '】最低保额为5万元，且为5万元整数倍'
            } else if (money > 200000) {
              toastText = '【' + name + '】最高保额为20万元'
            }
            break
          case '314': // 百万终身护理保险
            if (money < 3000 || money % 1000 !== 0) {
              toastText = '【' + name + '】保额最低3千元，且为千元整数倍'
            } else if (money > 500000) {
              toastText = '【' + name + '】保额最高为50万元'
            }
            break
          case '313': // 爱驾宝两全保险(2017)
            if (money < 10000 || money % 10000 !== 0) {
              toastText = '【' + name + '】保额最低1万元，且为1万元整数倍'
            }
            break
          case '292': // 千万护航两全保险
            if (!money) {
              toastText = '【' + name + '】50000元/份，1份起售'
            }
            break
          case '290': // 金财人生终身年金保险D款
            if (periodMoney < 10000) {
              toastText = '【' + name + '】最低年缴保费为1万元'
            } else if (periodMoney % 1000 !== 0) {
              toastText = '【' + name + '】保费需为1千元整数倍'
            }
            break
          case '288': // 恒久健康终身重大疾病保险2017
            if (money < 10000 || money % 1000 !== 0) {
              toastText = '最低保额为1万元,且为1千元整数倍'
            }
            break
          case '283': // 御享人生重大疾病保险
            if (money < 50000) {
              toastText = '【' + name + '】最低保额为5万元'
            }
            break
          case '272': // 盛世年年C款年金保险
            if (money < 150000 || money % 10000 !== 0) {
              toastText = '【' + name + '】最低保额为15万元，且为1万元整数倍'
            }
            break
          case '209': // 信泰人寿：健康100
            if (money < 50000 || money % 10000 !== 0) {
              toastText = '该主险最低保额为5万元，且为1万元整数倍'
            }
            break
          case '210': // 信泰人寿：健康100(铂金版)
            if (money < 300000 || money % 10000 !== 0) {
              toastText = '该主险最低保额为30万元，且为1万元整数倍'
            }
            break
          case '205': // 泰康：尊享岁月分红型
            if (money % 1000 !== 0) {
              toastText = '该主险保额应为1000元的整数倍'
            }
            break
          case '172': // 工银： 鑫丰年年
            if (this.mainPayYear === 1) {
              if (money < 3000) {
                toastText = '趸交的最低保额为3000元！'
              }
            } else if (money < 2000) {
              toastText = '最低保额为2000元！'
            }
            break
          case '165': // 爱相随-尊享版
            if (assuAge >= 18 && money > 1000000) {
              toastText = '【' + name + '】成年人最高保额为100万元'
            } else if (assuAge < 18 && money > 500000) {
              toastText = '【' + name + '】未成年人最高保额为50万元'
            } else if (this.mainPayYear === 19) {
              if (money < 300000 || money % 10000 !== 0) {
                toastText = '【' + name + '】19年交最低保额30万元，且为1万元整数倍！'
              }
            } else if (money < 50000 || money % 10000 !== 0) {
              toastText = '【' + name + '】保额最低5万元，且为1万元整数倍'
            }
            break
          case '130': // 乐安康
            if (money < 50000 || money % 10000 !== 0) {
              toastText = '该主险最低保额为5万元，且为1万元整数倍！'
            }
            break
          case '74': // 盛世年年
            if (this.mainPayYear === 1) {
              if (periodMoney < 10000 || periodMoney % 1000 !== 0) {
                toastText = '趸交的最低保费为1万元,且以千元递增！'
              }
            } else if (periodMoney < 5000 || periodMoney % 1000 !== 0) {
              toastText = '最低年缴保费为5千元,且以千元递增'
            }
            break
          case '8': // 御立方三号两全保险
            if (money < 10000) {
              toastText = '该主险最低保额为1万元'
            }
            break
        }
        if (toastText) {
          this.$toast.open(toastText)
          return false
        }
        return true
      },
      // 主险保费校验
      checkMainFee (safeid) {
        let toastText = null
        let periodMoney = this.insurance.period_money
        let money = this.insurance.money
        if (this.isBaseMoney && !this.insurance.period_money && !this.fuBaseMoney) {
          toastText = this.insurance.period_money === 0 ? '超出费率表计算范围，无法投保' : '请计算主险年缴保费'
        } else if (!this.isBaseMoney && !this.insurance.money && !this.fuBaseMoney) {
          toastText = this.insurance.money === 0 ? '超出费率表计算范围，无法投保' : '请计算主险基本保额'
        }
        if (toastText) {
          this.$toast.open(toastText)
          return false
        }

        switch (safeid) {
          case '360': // 恒大鑫福年
            if (money < 1000) {
              toastText = '该主险最低保额1千元！'
            }
            break
          case '8': // 御立方三号两全保险
            if (periodMoney < 1000) {
              toastText = '该主险最低年缴保费为1000元'
            }
            break
          case '283': // 御享人生重大疾病保险
            if (periodMoney < 1000) {
              toastText = '该主险最低年缴保费为1000元'
            }
            break
          case '205': // 尊享岁月养老年金保险（分红型）
            if (this.mainPayYear === 15 || this.mainPayYear === 20) {
              if (periodMoney < 150000) {
                toastText = '【' + name + '】15、20最低年交保费15万元'
              }
            } else {
              if (periodMoney < 200000) {
                toastText = '该交费期间最低年交保费20万元'
              }
            }
            break
        }
        if (toastText) {
          this.$toast.open(toastText)
          setTimeout(() => {
            this.insurance.period_money = ''
          }, 2000)
          return false
        }
        return true
      },
      // 校验附加险投保年龄
      checkExtraAge (safeid) {
        let assuAge = Number(this.assu.age)
        let applAge = Number(this.appl.age)
        let mainSafeYear = this.mainSafeYear
        let mainPayYear = this.mainPayYear
        let payOverage = Number(this.insurance.pay_year) - 1 + applAge // 期满年龄
        let toastText = null

        switch (safeid) {
          case '121':
            if (assuAge > 55) {
              toastText = '被保人年龄不能大于55周岁'
            }
            break
          case '131':
            if (applAge > 69) {
              toastText = '被豁免合同投保人年龄不能大于69周岁'
            }
            break
          case '148':
            if (assuAge > 70) {
              toastText = '被保人年龄不能大于70周岁'
            }
            break
          case '146':
          case '147':
          case '175':
          case '196':
          case '281':
            if (applAge > 68) {
              toastText = '被豁免合同投保人年龄不能大于68周岁'
            }
            break
          case '235':
          case '236':
          case '237':
          case '273':
            if (assuAge > 60) {
              toastText = '被保人年龄不能大于60周岁'
            }
            break
          case '285':
            if (applAge > 60 || payOverage > 75) {
              toastText = '投保人年龄不能大于60周岁,且期满年龄不能大于75岁'
            }
            break
          case '289':
            if (applAge > 60) {
              toastText = '被豁免合同投保人年龄不能大于60周岁'
            } else if (mainPayYear === 30) {
              toastText = '30年交不可附加该险种'
            }
            break
          case '293': // 尊享安康
            if (assuAge > 65) {
              toastText = '被保人年龄不能大于65周岁'
            }
            break
          case '294': // 恒顺
            if (assuAge > 65) {
              toastText = '被保人年龄不能大于65周岁'
            }
            break
          case '295': // 恒祥
            if (assuAge > 65) {
              toastText = '被保人年龄不能大于65周岁'
            }
            break
          case '362': // 附加信泰百万健康重大疾病
            if (mainPayYear === 1 && assuAge > 50) {
              toastText = '被保人年龄不能大于50周岁'
            } else if (mainPayYear === 3 && assuAge > 50) {
              toastText = '3年交被保人年龄不能大于50周岁'
            } else if (mainPayYear === 5 && assuAge > 50) {
              toastText = '5年交被保人年龄不能大于50周岁'
            } else if (mainPayYear === 10 && assuAge > 50) {
              toastText = '10年交被保人年龄不能大于50周岁'
            } else if (mainPayYear === 15 && assuAge > 45) {
              toastText = '15年交被保人年龄不能大于45周岁'
            } else if (mainPayYear === 20 && assuAge > 40) {
              toastText = '20年交被保人年龄不能大于40周岁'
            }
            break
          case '367': // 附加康乐一生投保人豁免保费重大疾病保险
            if (applAge > 50) {
              toastText = '投保人年龄不能大于50周岁，不可附加该险种'
            }
            break
          case '368': //
            if (mainPayYear === 20 && mainSafeYear === 70) {
              toastText = '保障期间为70年，缴费为20年交时，不可附加该险种'
            }
            break
          case '374': //
            if (assuAge > 54) {
              toastText = '被保人年龄不能大于54周岁'
            }
            break
        }

        if (toastText) {
          this.$toast.open(toastText)
          this.addonsSelected[safeid] = false
          this.$forceUpdate()
          return false
        }
        return true
      },
      // 校验附加险保费
      checkExtraForm (safeid) {
        let toastText = null
        let flag = this.flag[safeid]
        let periodMoney = this.insurance.period_money
        switch (safeid) {
          case '374': // 复星乐健一生门诊保险（主险）
            if (toastText) break
            if (this.fxljys366.mztc === '0') {
              toastText = '请选择乐健一生门急诊医疗保险套餐'
            } else if (this.fxljys366.mznmp === '0') {
              toastText = '请选择乐健一生门急诊医疗保险免赔额'
            }
            break
          case '362': // 附加百万健康两全保险
            if (!flag) {
              toastText = '请先选择保障期间'
            }
            break
          case '354': // 附加品质生活年金-中国人保
            if (toastText) break
            if (this.cache.derate_money354 === '') {
              toastText = '年缴保费不能为空'
            } else if (this.cache.derate_money354 !== 0 && this.cache.derate_money354 % 1000 !== 0) {
              toastText = '年缴保费为1000元整数倍，可为0'
            } else if (this.cache.derate_money354 > this.insurance.period_money * this.mainPayYear) {
              toastText = '该附加险保费不能超过主险总保费'
            }
            break
          case '349': // 附加金账户年金-工银
            if (toastText) break
            if (this.cache.derate_money349 === '') {
              toastText = '年缴保费不能为空'
            } else if ((this.cache.derate_money349 !== 0) && (this.cache.derate_money349 % 1000 !== 0)) {
              toastText = '年缴保费为1000元整数倍，可为0'
            } else if (this.cache.derate_money349 > this.insurance.period_money * this.mainPayYear) {
              toastText = '该附加险保费不能超过主险总保费'
            }
            break
          case '332': // 乐行天下
            if (toastText) break
            if (!flag) {
              toastText = '请先选择保险金额'
            }
            break
          case '295': // 恒祥
            if (toastText) break
            if (!this.cache.base_money295) {
              toastText = '请先输入保险金额'
            } else if (this.cache.base_money295 < 50 || this.cache.base_money295 > 100 || this.cache.base_money295 % 10 !== 0) {
              toastText = '保险金额范围50-100元，且为10的整数'
            }
            break
          case '294': // 恒顺
            if (toastText) break
            let extraMoney = flag > 50000 ? flag.toString().substr(1) : flag
            if (!flag) {
              toastText = '请先选择保险金额'
            } else if (extraMoney > this.insurance.period_money * this.mainPayYear * 0.2 && this.insurance.safe_id === '290') {
              // 主险--金财D
              toastText = '该附加险保额不超主合同总保费（期交保费*缴费年限）*20%'
            } else if (extraMoney > this.insurance.money * 0.2 && this.insurance.safe_id === '288') {
              // 恒久健康
              toastText = '该附加险保额不能大于主险保额的20%'
            } else if (extraMoney > this.insurance.money * 50000 * 0.2 && this.insurance.safe_id === '292') {
              // 千万护航
              toastText = '该附加险保额不能大于主险保额的20%'
            }
            break
          case '293': // 恒顺
            if (!flag) {
              toastText = '请先选择保险金额'
            }
            break
          case '291': // 金管家D款
            if (toastText) break
            if (this.cache.derate_money291 === '') {
              toastText = '年缴保费不能为空'
            } else if (this.cache.derate_money291 !== 0 && this.cache.derate_money291 % 1000 !== 0) {
              toastText = '年缴保费为1000元整数倍，可为0'
            } else if (this.cache.derate_money291 > this.insurance.period_money * this.mainPayYear) {
              toastText = '该附加险保费不能超过主险总保费'
            }
            break
          case '281':
            if (this.samePerson) {
              toastText = '投被保人为同人时不可附加该险种'
            } else if (this.mainPayYear === 1) {
              toastText = '主险趸交不可附加该险种'
            }
            break
          case '196':
            if (periodMoney < 1000) {
              toastText = '主险年交保费小于1000元不可附加该险种'
            }
            break
          case '273':
          case '175':
            if (!flag) {
              toastText = '请先选择计划'
            }
            break
          case '148':
            if (!this.cache.base_money148) {
              toastText = '请先输入保险金额'
            } else if (this.cache.base_money148 < 50000 || this.cache.base_money148 > 3000000) {
              toastText = '保险金额范围为5万~300万'
            } else if (this.cache.base_money148 > this.insurance.money * 5) {
              toastText = '保额不得超过主险保额的5倍'
            } else if (!flag) {
              toastText = '请先选择职业分类'
            }
            break
          case '147':
            if (periodMoney < 1000) {
              toastText = '主险年交保费小于1000元不可附加该险种'
            } else if (!flag) {
              toastText = '请先选择保险金额'
            }
            break
          case '146':
            if (!flag) {
              toastText = '请先选择保险金额'
            }
            break
          case '131':
            if (!periodMoney) {
              toastText = '请先完善其他附加险，算出主险年缴保费'
            }
            if (this.samePerson) {
              toastText = '投被保人为同人时不可附加该险种'
            }
            if (this.insurance.pay_year === '1') {
              toastText = '缴费期间为趸交不可附加该险种'
            }
            break
          case '86': // 附加豁免保险费重疾保险
          case '289':
          case '285': // 附加豁免保险费重大疾病保险
          case '284': // 附加豁免保险费定期寿险
          case '367': // 附加康乐一生投保人豁免保费重大疾病保险
            if (this.samePerson) {
              toastText = '投被保人为同人时不可附加该险种'
            }
            break
          case '121':
            if (periodMoney < 3000) {
              toastText = '主险年交保费小于3000元不可附加该险种'
            }
            break
          case '235': // 附加住院费用医疗（非社保型）
            if (this.addonsSelected[236]) {
              toastText = '社保与非社保只能选择一个'
            } else if (!flag) {
              toastText = '请先选择保险份数'
            }
            break
          case '236': // 附加住院费用医疗（社保型）
            if (this.addonsSelected[235]) {
              toastText = '社保与非社保只能选择一个'
            } else if (!flag) {
              toastText = '请先选择保险份数'
            }
            break
          case '237': // 附加住院费用医疗（社保型）
            if (!flag) {
              toastText = '请先选择保险份数'
            }
            break
        }
        if (toastText) {
          this.$toast.open(toastText)
          return false
        }
        return true
      },
      /**
       * 计算
       * @param isMain
       * @param addonSafeid
       * @returns {boolean}
       */
      calMoney (isMain, addonSafeid = 0) {
        if (this.uploading) {
          this.$toast.open('请勿连续点击！')
          return false
        }
        this.uploading = true
        setTimeout(() => {
          this.uploading = false
        }, 1000)

        this.mainPayYear = Number(this.insurance.pay_year)
        this.mainSafeYear = Number(this.insurance.safe_year)
        if (isMain && !this.checkMainForm()) {
          return false
        }
        const safeid = isMain ? this.insurance.safe_id : addonSafeid
        if (!safeid) {
          this.$toast.open('险种ID不正确', 'warn')
          return false
        }
        if (isMain) { // 主险
          if (!this.checkMainAge(safeid)) {
            return false
          }
          if (!this.checkMainMoney(safeid)) {
            return false
          }
        } else { // 附加险
          if (!this.checkExtraAge(safeid)) {
            return false
          }
          if (!this.checkExtraForm(safeid)) {
            return false
          }
        }
        let data = {
          admin_id: this.admin_id,
          applicant: this.appl.name,
          appl_sex: this.appl.sex === true ? 1 : 2,
          appl_age: this.appl.age,
          assured: this.assu.name,
          assu_sex: this.assu.sex === true ? 1 : 2,
          assu_age: this.assu.age,
          safe_year: this.mainSafeYear === 999 ? 0 : this.mainSafeYear,
          pay_year: this.mainPayYear,
          warranty_year: 1,
          genre: safeid,
          fj: !isMain,
          is_save: 0,
          derate_money: 0,
          need_packet: 0
        }
        // 添加特殊参数
        let filterSafeid = ['74', '182', '290', '348', '172', '352', '360', '362']
        if (filterSafeid.indexOf(safeid) > -1) {
          data = Object.assign(data, {
            assume_rate: '0',
            sa_one: '0',
            fa_one: '0',
            money_one: '0',
            sa_two: '0',
            fa_two: '0',
            money_two: '0',
            sa_three: '0',
            fa_three: '0',
            money_three: '0',
            sa_four: '0',
            fa_four: '0',
            money_four: '0',
            sa_five: '0',
            fa_five: '0',
            money_five: '0',
            sa_six: '0',
            fa_six: '0',
            money_six: '0',
            sa_seven: '0',
            fa_seven: '0',
            money_seven: '0',
            sa_eight: '0',
            fa_eight: '0',
            money_eight: '0',
            sa_night: '0',
            fa_night: '0',
            money_night: '0',
            sa_ten: '0',
            fa_ten: '0',
            money_ten: '0'
          })
        }
        // 计划书类型
        if (this.prospectus_types.length > 0) {
          data.type = this.prospectus_type
        }
        if (safeid === '309' || safeid === '280') {
          data.flag = this.prospectus_type
        } else if (safeid === '172') {
          data.flag = 0
        }

        // 计算保额还是保费
        if (this.isBaseMoney) {
          data.base_money = this.insurance.money
        } else {
          data.year_fee = this.insurance.period_money
        }

        let py = this.mainPayYear === 1 ? 1 : this.mainPayYear - 1 // 主险缴费期间减一年
        let periodMoney = this.insurance.period_money
        let money = this.insurance.money

        // 险种参数
        if (safeid === '368') {
          //  附加康乐一生轻症保险
          data.pay_year = this.mainPayYear
          data.safe_year = this.mainSafeYear === 999 ? 0 : this.mainSafeYear
          data.base_money = money * 0.2
        } else if (safeid === '367') {
          //  附加康乐一生投保人豁免保费重大疾病保险
          data.pay_year = py
          data.safe_year = this.mainSafeYear === 999 ? 0 : this.mainSafeYear
          if (this.addonRes[368]) {
            data.base_money = periodMoney + this.addonRes[368].年缴保费
          } else {
            data.base_money = periodMoney
          }
        } else if (safeid === '366') {
          //  复星乐健一生住院
          data.flag = this.fxljys366.shebao + this.fxljys366.zytc
          data = Object.assign(data, {
            zynmp: this.fxljys366.zynmp, // 住院年免赔
            zfbl: 1, // 自负比例
            mznmp: this.fxljys366.mznmp, // 门诊年免赔
            mzptcmp: this.fxljys366.mzptcmp, // 门诊普通次免赔
            mztxcimp: this.fxljys366.mztxcimp // 门诊特需次免赔
          })
        } else if (safeid === '374') {
          //  复星乐健一生门诊
          data.flag = this.fxljys366.shebao + this.fxljys366.mztc
          data = Object.assign(data, {
            zynmp: this.fxljys366.zynmp, // 住院年免赔
            zfbl: 1, // 自负比例
            mznmp: this.fxljys366.mznmp, // 门诊年免赔
            mzptcmp: this.fxljys366.mzptcmp, // 门诊普通次免赔
            mztxcimp: this.fxljys366.mztxcimp // 门诊特需次免赔
          })
        } else if (safeid === '362') {
          // 信泰百万健康重大疾病
          data.pay_year = this.mainPayYear
          data.safe_year = this.flag[safeid]
          data.flag = this.flag[safeid]
        } else if (safeid === '360') {
          // 恒大鑫福年金
          data.pay_year = this.mainPayYear
          data.safe_year = this.mainSafeYear
          data.flag = 0
        } else if (safeid === '352') {
          // 中国人保尊赢人生
          data.pay_year = this.mainPayYear
          data.safe_year = this.mainSafeYear
          data.flag = this.flag[safeid]
        } else if (safeid === '354') {
          // 中国人保尊赢人生附加
          data.pay_year = 1
          data.safe_year = 1
          data.flag = this.cache.derate_money354
        } else if (safeid === '349') {
          // 工银附加金账户
          data.pay_year = 1
          data.safe_year = 1
          data.flag = this.cache.derate_money349
        } else if (safeid === '333') {
          // 乐行天下附加
          data.pay_year = this.mainPayYear
          data.safe_year = this.mainSafeYear
          data.base_money = 100
        } else if (safeid === '332') {
          // 乐行天下附加
          data.pay_year = this.mainPayYear
          data.safe_year = this.mainSafeYear
          data.base_money = this.flag[safeid]
        } else if (safeid === '318') {
          // 乐行天下主险
          data = Object.assign(data, {
            money_one: this.cache.pay_money332,
            money_two: this.cache.pay_money333
          })
        } else if (safeid === '295') {
          // 恒祥
          data.pay_year = 1
          data.safe_year = 1
          data.base_money = this.cache.base_money295
        } else if (safeid === '294') {
          // 恒顺
          data.pay_year = 1
          data.safe_year = 1
          data.base_money = this.flag[safeid] > 50000 ? this.flag[safeid].toString().substr(1) : this.flag[safeid]
          data.flag = this.flag[safeid]
        } else if (safeid === '293') {
          // 尊享安康
          data.pay_year = 1
          data.safe_year = 1
          data.base_money = 500000
          data.flag = this.flag[safeid]
        } else if (safeid === '291') { // 附加金管家年金保险
          data.pay_year = 1
          data.safe_year = 1
          data.derate_money = this.cache.derate_money291
          data.flag = this.cache.derate_money291
        } else if (safeid === '290') { // 金财D
          data.level = 2
          data.derate_money = this.cache.derate_money291
        } else if (safeid === '289') {
          // 附加投保人豁免2017
          data.pay_year = py
          data.safe_year = py
          data.base_money = periodMoney
        } else if (safeid === '292') {
          data.base_money = money * 50000
        } else if (safeid === '285' || safeid === '284') {
          // 附加豁免保险费重大疾病保险 附加豁免保险费定期寿险
          data.pay_year = py
          data.safe_year = py
          data.base_money = periodMoney
        } else if (safeid === '281') {
          data.pay_year = this.mainPayYear
          data.safe_year = this.mainPayYear
          data.base_money = periodMoney
        } else if (safeid === '205') {
          data.flag = this.flag[safeid]
          data.level = 0
        } else if (safeid === '273') {
          data.pay_year = 1
          data.safe_year = 1
          data.flag = this.flag[safeid]
        } else if (safeid === '235' || safeid === '236' || safeid === '237') {
          data.pay_year = 1
          data.safe_year = 1
          data.base_money = periodMoney
          data.flag = this.flag[safeid]
        } else if (safeid === '196') { // 附加住院津贴医疗保险
          data.pay_year = 1
          data.safe_year = 1
          if (periodMoney >= 1000 && periodMoney <= 3000) {
            data.base_money = 1
          } else if (periodMoney > 3000 && periodMoney <= 10000) {
            data.base_money = 2
          } else if (periodMoney > 10000 && periodMoney <= 20000) {
            data.base_money = 3
          } else if (periodMoney > 20000 && periodMoney <= 30000) {
            data.base_money = 5
          } else if (periodMoney > 30000 && periodMoney <= 50000) {
            data.base_money = 7
          } else if (periodMoney > 50000) {
            data.base_money = 10
          }
          data.year_fee = periodMoney
        } else if (safeid === '177') { // 附加御立方三号重大疾病保险-工银
          data.base_money = money
        } else if (safeid === '175') { // 附加乐无忧住院医疗保险
          data.pay_year = 1
          data.safe_year = 1
          data.flag = this.flag[safeid]
        } else if (safeid === '148') { // 附加综合意外伤害保险
          data.pay_year = 1
          data.safe_year = 1
          data.base_money = this.cache.base_money148
          data.flag = this.flag[safeid]
        } else if (safeid === '147' || safeid === '146') {
          // 附加住院费用医疗保险  附加意外伤害医疗B
          data.pay_year = 1
          data.safe_year = 1
          data.base_money = money
          data.year_fee = periodMoney
          data.flag = this.flag[safeid]
        } else if (safeid === '131') { // 附加乐相伴豁免保险费重大疾病保险
          data.pay_year = py
          data.safe_year = py
          data.year_fee = periodMoney
        } else if (safeid === '121') {
          data.pay_year = 1
          data.safe_year = 1
          data.base_money = 250000
        } else if (safeid === '94') {
          data.base_money = periodMoney * this.mainPayYear
          data.safe_year = 85
        } else if (safeid === '86') {
          data.pay_year = py
          data.safe_year = py
          data.base_money = periodMoney
        } else if (safeid === '11') {
          data.safe_year = 999
          data.pay_year = 1
          data.base_money = 0
        }

        if (isMain) {
          this.mainInsData = data
        } else {
          this.addonInsData[safeid] = data
          if (noNeedCal.indexOf(safeid) > -1) {
            return false
          }
        }

        utils.post('Prospectus/CreateBook3', qs.stringify({
          safes: JSON.stringify([data])
        })).then(ret => {
          if (ret.data.data &&
            ret.data.data[safeid] &&
            ret.data.data[safeid].main &&
            ret.data.data[safeid].main.list &&
            ret.data.data[safeid].main.list[1]) {
            if (isMain) {
              let data = ret.data.data[safeid].main.list[1]
              if (this.isBaseMoney && !this.fuBaseMoney) {
                this.insurance.period_money = data['年缴保费']
                if (safeid === '366') {
                  this.insurance.period_money = data['住院总保费']
                }
              } else if (this.isBaseMoney && this.fuBaseMoney) {
                this.insurance.period_money = data['年缴保费']
                this.insurance.money = ret.data.data[safeid].base_money
              } else {
                if (safeid === '360') {
                  this.insurance.money = data['保额']
                } else {
                  this.insurance.money = ret.data.data[safeid].base_money
                }
              }
              if (safeid !== '318' && safeid !== '366') {
                this.resetAddon()
              }
              this.checkMainFee(safeid)
            } else {
              this.addonRes[safeid] = ret.data.data[safeid].main.list[1]
              if (safeid === '332') {
                this.cache.pay_money332 = this.addonRes[safeid]['年缴保费'] || this.addonRes[safeid]['年缴保费(元)']
              } else if (safeid === '333') {
                this.cache.pay_money333 = this.addonRes[safeid]['年缴保费'] || this.addonRes[safeid]['年缴保费(元)']
              } else if (safeid === '374') {
                this.fxljys366.mzmoney = this.addonRes[safeid]['门诊总保费']
              }
              this.$forceUpdate()
            }
          } else {
            this.$toast.open('计算出错', 'error')
          }
        })
      },
      checkIns () {
        if (!this.checkMainForm()) {
          return false
        } else if (!this.checkMainFee(this.insurance.safe_id)) {
          return false
        }
        if (this.insurance.safe_id === '318' && !this.insurance.period_money && !this.insurance.money) {
          // 乐行天下
          this.$toast.open('请乐行天下先计算主险保费')
          return false
        }
        let bool = true
        for (let i in this.addonsSelected) {
          if (this.addonsSelected[i] && !this.checkExtraForm(i)) {
            bool = false
          }
        }
        mustSelected.forEach(item => {
          if (this.Addons[item] && !this.addonsSelected[item]) {
            let name = this.Addons[item].name
            this.$toast.open('【' + name + '】为必选')
            bool = false
          }
        })
        return bool
      },
      saveIns () {
        console.info('saveIns:', this.insIndex)
        this.ins[this.insIndex] = {
          main: this.mainInsData,
          insurance: this.insurance,
          addon: this.addonInsData
        }
        this.$store.commit('SET_PLAN', this.ins)
      }
    },
    created () {
      if (this.pl_id && this.insList && this.edit.main) {
        let main = this.edit.main
        let insInfo = utils.getCompanyId(this.insList.main, main.safe_id)
        this.sc_id = insInfo.sc_id
        this.mainInsurance = insInfo
        this.insChanged()
      }
    }
  }
</script>
