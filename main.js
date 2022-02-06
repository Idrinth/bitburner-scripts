/**
 * @param {NS} ns
 * @param {string} targetIp
 * @param {string[]} visited
 **/
async function process(ns, targetIp, visited) {
    if (visited.indexOf(targetIp) > -1) {
        return;
    }
    ns.print('  ' + targetIp);
    visited.push(targetIp);
    const children = ns.scan(targetIp, false);
    for (let pos = 0; pos < children.length; pos++) {
        if (visited.indexOf(children[pos]) === -1 && await breakIn(ns, children[pos])) {
            await enter(ns, children[pos], visited);
        }
    }
}
/**
 * @param {NS} ns
 * @param {string} targetIp
 * @param {string[]} visited
 **/
async function enter(ns, targetIp, visited) {
    const ram = ns.getScriptRam('hack.js');
    const count = Math.floor(ns.getServerMaxRam(targetIp) / ram);
    if (!targetIp.match(/^butler-/) && Math.ceil(count * ram * 10) !== Math.ceil(ns.getServerUsedRam(targetIp) * 10) && count > 0) {
        ns.scriptKill('hack.js', targetIp)
        await ns.scp('hack.js', ns.getHostname(), targetIp);
        ns.exec('hack.js', targetIp, count, targetIp);
    }
    await process(ns, targetIp, visited);
}
/**
 * @param {NS} ns
 * @param {string} targetIp
 **/
async function breakIn(ns, targetIp) {
    if (ns.hasRootAccess(targetIp)) {
        return true;
    }
    if (ns.getServerRequiredHackingLevel(targetIp) > ns.getHackingLevel()) {
        return false;
    }
    let opened = 0;
    if (ns.fileExists('BruteSSH.exe') && ns.brutessh(targetIp)) {
        opened++;
    }
    if (ns.fileExists('FTPCrack.exe') && ns.ftpcrack(targetIp)) {
        opened++;
    }
    if (ns.fileExists('relaySMTP.exe') && ns.relaysmtp(targetIp)) {
        opened++;
    }
    if (ns.fileExists('HTTPWorm.exe') && ns.httpworm(targetIp)) {
        opened++;
    }
    if (ns.fileExists('SQLInject.exe') && ns.sqlinject(targetIp)) {
        opened++;
    }
    if (ns.getServerNumPortsRequired(targetIp) <= opened) {
        ns.nuke(targetIp);
        const books = ns.ls(targetIp, '.lit');
        for (var pos = books.length - 1; pos >= 0; pos--) {
            await ns.scp(books[pos], targetIp, 'home');
            ns.rm(books[pos], targetIp);
        }
        ns.toast(targetIp + ' is hacked');
    }
    return ns.hasRootAccess(targetIp);
}
/**
 *  @param {NS} ns
 **/
export async function main(ns) {
    ns.disableLog('ALL');
    while (true) {
        await process(ns, ns.getHostname(), ['darkweb']);
        await ns.sleep(100);
    }
}
