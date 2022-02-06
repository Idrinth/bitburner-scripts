/**
 * @param {NS} ns
 **/
export async function main(ns) {
	const host = ns.getHostname();
	let usedRam = 0;
	for (const script of ['hack.js', 'main.js', 'hack-net.js', 'servers.js', 'darkweb.js']) {
		if (ns.scriptRunning(script, host)) {
			ns.scriptKill(script, host);
		}
	}
	if (host === 'home') {
		for (const script of ['main.js', 'hack-net.js', 'servers.js', 'darkweb.js']) {
			ns.exec(script, host);
			usedRam += ns.getScriptRam(script);
		}
	}
	while (!ns.hasRootAccess('foodnstuff')) {
		await ns.sleep(1000);
	}
	const ram = ns.getServerMaxRam(host) - usedRam;
	ns.spawn('hack.js', Math.floor(ram/ns.getScriptRam('hack.js')), 'foodnstuff');
}
