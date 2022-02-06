/**
 * @param {NS} ns
 **/
export async function main(ns) {
	while (true) {
		const sources = ns.getOwnedSourceFiles();
		let level = 0;
		for (const source in sources) {
			/**
			 * @var {SourceLevel} source
			 */
			if (level < source.level) {
				level = source.level;
			}
		}
		if (level >= 4 && ns.connect('darkweb')) {
			ns.exec('buy BruteSSH.exe');
			ns.exec('buy FTPCrack.exe');
			ns.exec('buy relaySMTP.exe');
			ns.exec('buy HTTPWorm.exe');
			ns.exec('buy SQLInject.exe');
			ns.exec('buy ServerProfiler.exe');
			ns.exec('buy DeepscanV1.exe');
			ns.exec('buy DeepscanV2.exe');
			ns.exec('buy AutoLink.exe');
			ns.exec('buy Formulas.exe');
			ns.connect('home');
		}
		await ns.sleep(1000);
	}
}
