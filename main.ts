const harvesterName = 'harvester';
const upgraderName = 'upgrader';
const roadBuilder = 'roader';

const calculatePath = (creep: Creep) => {
    const destination = creep.room.controller;
    var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    return PathFinder.search(source.pos, destination.pos);
}

const count = (role: string, room: Room): number => {
    return _.filter(Game.creeps, (creep) => creep.memory.role === role && creep.room.controller && creep.room === room).length;
}

module.exports.loop = () => {

    for (const key in Game.rooms) {
        const room = Game.rooms[key];
        const spawn = room.find(FIND_MY_SPAWNS)[0];

        const roaders = count(roadBuilder, room);
        if (roaders < 2) {
            spawn.spawnCreep([MOVE, WORK, CARRY], `${Date.now()}`, { memory: { role: roadBuilder } });
        }

        var harvesterCount = count(harvesterName, room)
        if (harvesterCount < 3) {
            spawn.spawnCreep([MOVE, WORK, CARRY], `${Date.now()}`, { memory: { role: harvesterName } });
        }
    }

    for (const key in Game.creeps) {
        const creep = Game.creeps[key];

        if (creep.memory.role === roadBuilder) {
            if (!creep.memory.path) {
                creep.memory.path = calculatePath(creep);
                console.log("calculating path");
            } else {

            }
        }

        if (creep.memory.role === upgraderName) {
            if (creep.store.getUsedCapacity() !== 0) {
                if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE)
                    creep.moveTo(creep.room.controller.pos);
            } else {
                creep.memory.role = harvesterName;
                creep.say(harvesterName);
                const closest = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
                if (creep.harvest(closest) === ERR_NOT_IN_RANGE)
                    creep.moveTo(closest.pos);
            }
        }

        if (creep.memory.role === harvesterName) {
            if (creep.store.getFreeCapacity() === 0) {
                creep.memory.role = upgraderName;
                creep.say(upgraderName);
                if (creep.store.getFreeCapacity() === 0) {
                    if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE)
                        creep.moveTo(creep.room.controller.pos);
                }
            } else {
                const closest = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
                if (creep.harvest(closest) === ERR_NOT_IN_RANGE)
                    creep.moveTo(closest.pos);
            }
        }
    }
};