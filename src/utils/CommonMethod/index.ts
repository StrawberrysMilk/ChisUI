import { type Ref, nextTick } from 'vue';
import { DICT_CACHE } from '@/store/mutation-types';
import {
  GetDictInfo,
  GetDictTYInfo,
  GetDicttTypeInfo,
} from '@/api/modular/system/dictManage';
import { useUserInfoStore } from '@/store/global';

/**
 * 将扁平数组转换为树形结构（支持动态字段名）
 * @param {Array} data 原始数组
 * @param {Object} options 配置选项
 * @param {string} options.codeKey 节点编码字段名，默认'JGBM'
 * @param {string} options.pCodeKey 父节点编码字段名，默认'PJGBM'
 * @param {string} options.rootValue 根节点的父编码值，默认'0'
 * @returns {Array} 树形结构数组
 */
export const buildTree = (data: any[], options = {}) => {
  const {
    codeKey = 'JGBM',
    pCodeKey = 'PJGBM',
    rootValue = '0',
  } = options as {
    codeKey?: string | number;
    pCodeKey?: string | number;
    rootValue?: string | number;
  };

  // 先深拷贝一份数据，避免污染原始数据
  const cloneData = data.map((item) => ({ ...item }));

  // 构建以codeKey为键的map
  const dataMap: Record<string, any> = {};
  cloneData.forEach((item) => {
    dataMap[item[codeKey]] = item;
    item.children = [];
  });

  const tree: any[] = [];
  cloneData.forEach((item) => {
    const parent = dataMap[item[pCodeKey]];
    if (item[pCodeKey] === rootValue || !parent) {
      tree.push(item);
    } else {
      parent.children.push(item);
    }
  });

  // 去除空children
  function cleanEmptyChildren(nodes: any[]) {
    nodes.forEach((node) => {
      if (node.children.length === 0) {
        delete node.children;
      } else {
        cleanEmptyChildren(node.children);
      }
    });
  }
  cleanEmptyChildren(tree);

  return tree;
};

export const getDynamicWidth = (numtj: number, colSpan: number) => {
  // colSpan为当前分栏数，6表示3等分，4表示4等分
  let width = '80%';
  let margin = '5px 0 5px 10px';
  if (numtj % colSpan === 1) {
    width = '100%';
  } else if (numtj % colSpan === 0) {
    margin = '5px 0';
  }
  return { width, margin };
};

// 计算栅栏份数
export function jsdfs() {
  // 这里根据实际断点和布局调整
  const width = window.innerWidth;
  let currentColSpan = 24;
  if (width < 576) {
    // xs
    currentColSpan = 24;
  } else if (width < 768 && width >= 576) {
    // sm
    currentColSpan = 24;
  } else if (width < 1200 && width >= 768) {
    // md
    currentColSpan = 3;
  } else if (width >= 1600) {
    currentColSpan = 4;
  }
  return currentColSpan as number;
}

/**
 * 计算按钮宽度和布局参数
 * @param {Ref<number>} classTagWidth 分类标签宽度
 * @param {Ref<number>} rigbtnWidth 右侧按钮宽度
 * @param {Ref<number>} leftbutWidth 左侧按钮宽度
 * @param {Ref<number>} leftBt 左侧按钮数量
 * @param {string} containerSelector 容器选择器，默认为'.FlexOperation'
 * @param {string} buttonSelector 按钮选择器，默认为'button'
 * @description 根据指定容器内的按钮数量和位置，计算各个区域的宽度
 */
export function calculateButtonWidths(
  classTagWidth: Ref<number>,
  rigbtnWidth: Ref<number>,
  leftbutWidth: Ref<number>,
  leftBt: Ref<number>,
  containerSelector: string = '.FlexOperation',
  buttonSelector: string = 'button'
) {
  const btnArr = document.querySelectorAll(
    `${containerSelector} ${buttonSelector}`
  );
  const flexElement = document.querySelector(containerSelector) as HTMLElement;
  const flexWid = flexElement ? flexElement.offsetWidth : 0;

  classTagWidth.value = Math.floor(flexWid * 0.98);
  rigbtnWidth.value = 0;
  leftbutWidth.value = 0;

  for (let i = 0; i < btnArr.length; i++) {
    const btn = btnArr[i] as HTMLElement;
    if (i <= leftBt.value - 1 && leftBt.value) {
      leftbutWidth.value += btn && btn.offsetWidth ? btn.offsetWidth + 10 : 0;
    } else {
      rigbtnWidth.value += btn && btn.offsetWidth ? btn.offsetWidth + 10 : 0;
    }
  }
}

/**
 * 控制按钮是否显示
 *
 * @author zx
 * @date 2025/07/30 02:34
 */
export function hasPerm(permission: string) {
  const userInfo = useUserInfoStore();
  const myBtns = userInfo.permissions;
  const admintype = userInfo.adminType;
  if (admintype == '1') {
    return true;
  }
  return myBtns.includes(permission);
}

/**
 * 机构判断控制按钮是否显示
 *
 * @author zx
 * @date 2025/07/30 02:34
 */
export function hasBtnOrg(orgid: string) {
  const userInfo = useUserInfoStore();
  const admintype = userInfo.adminType;
  if (admintype == '1') {
    return true;
  }
  return String(userInfo.orgInfo.orgId ?? '') === String(orgid);
}

/**
 * 计算按钮顶部位置
 * @param {Ref<string>} buttonTop 按钮顶部位置
 * @param {string} containerSelector 容器选择器，默认为'.FlexOperation'
 * @param {number} offset 偏移量，默认为37
 * @description 根据容器高度计算按钮的顶部位置
 */
export function calculateButtonTop(
  buttonTop: Ref<string>,
  containerSelector: string = '.FlexOperation',
  offset: number = 37
) {
  const container = document.querySelector(containerSelector) as HTMLElement;
  if (container) {
    const height = container.clientHeight;
    buttonTop.value = height - offset + 'px';
  } else {
    buttonTop.value = '';
  }
}

// 字典项类型定义
interface DictItem {
  label: string;
  value: string;
  MC?: string;
  DM?: string;
  code?: string;
  typeCode?: string;
  dm?: string;
}

// 字典缓存项类型定义
interface DictCacheItem {
  data: DictItem[];
  info?: any;
  timestamp: number;
}

/**
 * 获取字典类型数据
 * @param {string} zddm 字典代码，支持多个传递，以','分隔
 * @param {string} zddmisAll 不传，则不会unshift({ label: '全部', value: '', MC: '全部', DM: '' })在开头
 * @param {string} zddmismc 不换则默认value取值为MC，传，则zddmismc中包含的zddm，取值为DM
 * @return Promise<Record<string, DictItem[]>>
 */
export const GetDictType = (
  zddm: string = '025',
  dictType: boolean | string = true,
  zddmisAll = '',
  zddmismc = '',
  qb: { qbAll?: string; qbCode?: string } = {},
): Promise<Record<string, DictItem[]>> => {
  // 兼容旧版 GetDictType(zddm, zddmisAll, zddmismc) 调用：第二参数为普通编码字符串时仍视为 zddmisAll。
  if (typeof dictType === 'string' && dictType !== 'true' && dictType !== 'false') {
    const legacyAll = dictType;
    const legacyDm = zddmisAll;
    zddmisAll = legacyAll;
    zddmismc = legacyDm;
    dictType = true;
  }
  const all = { qbAll: '全部', qbCode: '', ...qb };
  const isSystem = dictType !== false && dictType !== 'false';
  const cacheKey = isSystem ? DICT_CACHE : 'tyDictCache';
  const readCache = (): Record<string, DictCacheItem> => {
    try { return JSON.parse(localStorage.getItem(cacheKey) || '{}') || {}; } catch { return {}; }
  };
  const writeCache = (cache: Record<string, DictCacheItem>) => {
    try { localStorage.setItem(cacheKey, JSON.stringify(cache)); } catch { /* storage may be unavailable */ }
  };

  return (async () => {
    const cache = readCache();
    const result: Record<string, DictItem[]> = {};
    const codes = [...new Set(zddm.split(',').map(code => code.trim()).filter(Boolean))];
    const allCodes = new Set(zddmisAll.split(',').map(code => code.trim()).filter(Boolean));
    const dmCodes = new Set(zddmismc.split(',').map(code => code.trim()).filter(Boolean));
    const now = Date.now();
    const missing: string[] = [];
    codes.forEach(code => {
      if (cache[code] && now - cache[code].timestamp <= 30 * 60 * 1000) result[code] = cache[code].data;
      else missing.push(code);
    });
    if (missing.length) {
      const param = { NoParm: true, requestData: { DataInput: { ZDDMS: missing.join(',') } } };
      const [response, infoResponse] = await Promise.all([
        isSystem ? GetDictInfo(param) : GetDictTYInfo(param),
        GetDicttTypeInfo(param),
      ]);
      if (!response?.success) throw new Error('Failed to fetch data');
      const rows: any[] = Array.isArray(response.data) ? response.data : [];
      const infos: any[] = Array.isArray(infoResponse?.data) ? infoResponse.data : [];
      missing.forEach(code => {
        const mapped = rows.filter(item => String(item.ZDDM) === code).map(item => ({
          ...item,
          label: item.MC,
          value: dmCodes.has(code) ? item.DM : item.MC,
          dm: item.DM,
        }));
        if (allCodes.has(code)) mapped.unshift({ label: all.qbAll!, value: all.qbCode!, MC: all.qbAll, DM: all.qbCode });
        const unique = mapped.filter((item: DictItem, index: number, self: DictItem[]) => index === self.findIndex((other: DictItem) => other.label === item.label));
        result[code] = unique;
        cache[code] = { data: unique, info: infos.find(item => String(item.ZDDM) === code), timestamp: now };
      });
      writeCache(cache);
    }
    Object.keys(result).forEach(code => {
      const list = result[code] || [];
      const hasAll = list[0]?.label === all.qbAll;
      if (allCodes.has(code) && !hasAll) list.unshift({ label: all.qbAll!, value: all.qbCode!, MC: all.qbAll, DM: all.qbCode });
      if (!allCodes.has(code) && hasAll) list.shift();
      list.forEach((item: DictItem) => { if (item.label !== all.qbAll) item.value = dmCodes.has(code) ? (item.dm ?? item.DM ?? '') : (item.MC ?? item.value); });
      const seen = new Set<string>();
      result[code] = list.filter((item: DictItem) => item?.label && !seen.has(item.label) && seen.add(item.label));
    });
    return result;
  })();
};

/**
 * 计算表格高度
 * @param {Ref<number>} tableHeight 表格高度引用
 * @param {Object} options 配置选项
 * @param {string} options.layoutHeadSelector 布局头部选择器，默认为'.layout_head'
 * @param {string} options.multiTabHeaderSelector 多标签头部选择器，默认为'.multi_tab_header'
 * @param {string} options.flexOperationSelector 操作栏选择器，默认为'.FlexOperation'
 * @param {string} options.tableHeaderSelector 表格头部选择器，默认兼容当前 Ant Table 与 shadcn Table
 * @param {string} options.paginationRowSelector 分页行选择器，默认为'.pagination_row'
 * @param {number} options.extraOffset 额外偏移量，默认为47 (32 + 15)
 * @description 根据页面布局元素计算表格的合适高度
 */
export function calculateTableHeight(
  tableHeight: Ref<number>,
  options: {
    layoutHeadSelector?: string;
    multiTabHeaderSelector?: string;
    flexOperationSelector?: string;
    tableHeaderSelector?: string;
    paginationRowSelector?: string;
    extraOffset?: number;
  } = {}
) {
  const {
    layoutHeadSelector = '.layout_head',
    multiTabHeaderSelector = '.multi_tab_header',
    flexOperationSelector = '.FlexOperation',
    tableHeaderSelector = '.ant-table-thead, [data-slot="table-header"]',
    paginationRowSelector = '.pagination_row',
    extraOffset = 47
  } = options;

  // 获取各个布局元素的高度
  const layoutHead = document.querySelector(layoutHeadSelector) as HTMLElement;
  const antlayoutHeader = document.querySelector(multiTabHeaderSelector) as HTMLElement;
  const FlexOperation = document.querySelector(flexOperationSelector) as HTMLElement;
  const tableHeader = document.querySelector(tableHeaderSelector) as HTMLElement;
  const paginationRow = document.querySelector(paginationRowSelector) as HTMLElement;

  // 计算各个元素的高度
  const layoutHeadHeight = layoutHead ? layoutHead.clientHeight : 0;
  const antlayoutHeaderHeight = antlayoutHeader ? antlayoutHeader.clientHeight : 0;
  const FlexOperationHeight = FlexOperation ? FlexOperation.clientHeight : 0;

  // 使用 nextTick 确保 DOM 更新完成后再计算表格头部和分页行高度
  nextTick(() => {
    const tableHeaderHeight = tableHeader ? tableHeader.clientHeight : 0;
    const paginationRowHeight = paginationRow ? paginationRow.clientHeight : 0;

    // 计算表格高度：窗口高度 - 所有固定元素高度 - 额外偏移量
    // tableHeight.value = window.innerHeight - layoutHeadHeight - antlayoutHeaderHeight - FlexOperationHeight - tableHeaderHeight - paginationRowHeight - extraOffset;
    tableHeight.value = window.innerHeight - layoutHeadHeight - antlayoutHeaderHeight - FlexOperationHeight - tableHeaderHeight - extraOffset;
  });
}
