const data = {
	nodes: [],
	rams: {},
	cores: {},
	levels: {}
}
/**
 * @param {number} i
 * @param {string} type
 * @param {number} now
 */
function updateList(i, type, now)
{
	if (data.nodes[i] && now === data.nodes[i][type]) {
		return;
	}
	const types = type+"s";
	if (data.nodes[i] && data.nodes[i][type]) {
		var previous = data.nodes[i][type];
		if (data[types][previous]) {
			data[types][previous] = data[types][previous].filter(function(value) {
				return value !== i;
			});
			if (data[types][previous].length === 0) {
				delete data[types][previous];
			}
		}
	} else if(!data.nodes[i]) {
		data.nodes[i] = {};
	}
	data.nodes[i][type] = now;
	data[types][now] = data[types][now] ? data[types][now] : [];
	data[types][now].push(i);
}
/**
 * @param {NS} ns
 * @param {number} i
 */
function updateNode(ns, i) {
	const stats = ns.hacknet.getNodeStats(i);
	updateList(i, 'ram', stats.ram);
	updateList(i, 'core', stats.cores);
	updateList(i, 'level', stats.level);
}
/**
 * @param {NS} ns
 * @param {number} last
 */
function update(ns, last) {
	if (last > -1) {
		return updateNode(ns, last);
	}
	for (let i = ns.hacknet.numNodes() - 1; i >= 0; i--) {
		updateNode(ns, i);
	}
}
function getLowestNode() {
	return {
		ram: data.rams[Object.keys(data.rams).sort(function(a, b){return a-b})[0]][0],
		core: data.cores[Object.keys(data.cores).sort(function(a, b){return a-b})[0]][0],
		level: data.levels[Object.keys(data.levels).sort(function(a, b){return a-b})[0]][0]
	};
}
function arrayMin(list) {
	var min = list.pop();
	while (list && list.length > 0) {
		min = Math.min(min, list.pop())
	}
	return min;
}
/**
 * @param {NS} ns
 * @param {number} money
 **/
async function waitForMoney(ns, money) {
	while (ns.getServerMoneyAvailable('home') <= money) {
		await ns.sleep(100);
	}
}
/**
 * @param {NS} ns
 **/
async function buy (ns) {
	const nodePrice = Math.ceil(ns.hacknet.getPurchaseNodeCost());
	if (data.nodes.length === 0) {
		await waitForMoney(ns, nodePrice);
		ns.hacknet.purchaseNode();
		ns.print("purchased new node@0");
		return ns.hacknet.numNodes()-1;
	}
	const lowest = getLowestNode();
	const ramPrice = Math.ceil(ns.hacknet.getRamUpgradeCost(lowest.ram, 1));
	const corePrice = Math.ceil(ns.hacknet.getCoreUpgradeCost(lowest.core, 1));
	const levelPrice = Math.ceil(ns.hacknet.getLevelUpgradeCost(lowest.level, 1));
	const min = arrayMin([ramPrice, corePrice, levelPrice, nodePrice]);
	await waitForMoney(ns, min);
	switch (min) {
		case nodePrice:
			ns.hacknet.purchaseNode();
			const pos = ns.hacknet.numNodes()-1;
			ns.print("purchased new node@"+pos);
			return pos;
		case corePrice:
			ns.hacknet.upgradeCore(lowest.core, 1);
			ns.print("purchased new core@"+lowest.core);
			return lowest.core;
		case ramPrice:
			ns.hacknet.upgradeRam(lowest.ram, 1);
			ns.print("purchased new ram@"+lowest.ram);
			return lowest.ram;
		case levelPrice:
			ns.hacknet.upgradeLevel(lowest.level, 1);
			ns.print("purchased new level@"+lowest.level);
			return lowest.level;
		default:
			ns.print("failed purchasing");
			return main.buy();
	}
}
/**
 * @param {NS} ns
 **/
export async function main(ns) {
	ns.disableLog('ALL');
	let last = -1;
	while (true) {
		update(ns, last);
		ns.print('updated '+last);
		last = await buy(ns);
		await ns.sleep(100);
	}
}
