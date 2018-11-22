// libs
import jwt from 'jsonwebtoken'
import httpStatus from 'http-status'
import getOr from 'lodash/fp/getOr'
import split from 'lodash/fp/split'
import flow from 'lodash/fp/flow'
import map from 'lodash/map'

// src
import {
    findOne,
    listAll,
    findById,
    findMultiple,
    createOne,
    createMutiple,
    destroy,
    update,
    findAcross,
} from '../utils'
import config from '../../config/config'
import Announcement from '../models/announcement.model'

//Create funtions
function createBus(req, res, next) {
    const { registration_no, description, driver_id } = getOr({}, 'body')(req)
    return findOne('Bus', { registration_no }).then(resBus => {
        if (!resBus) {
            return createOne('Bus', {
                registration_no,
                description,
                driver_id,
            }).then(bus => {
                return res.status(200).json({ status: 200, data: bus })
            })
        }

        return res
            .status(200)
            .json({ status: 302, data: { message: 'Bus Already Exists' } })
    })
}
function createStudent(req, res, next) {
    const {
        fullname,
        grade,
        shift,
        parent_id,
        driver_id,
        status,
        photo,
    } = getOr({}, 'body')(req)

    return findOne('Student', { fullname, parent_id }).then(resStu => {
        if (!resStu) {
            return createOne('Student', {
                fullname,
                grade,
                shift,
                parent_id,
                driver_id,
                status,
                photo,
            }).then(student => {
                return res.status(200).json({ status: 200, data: student })
            })
        }

        return res
            .status(200)
            .json({ status: 302, data: { message: 'Student Already Exists' } })
    })
}

function createNotification(req, res, next) {
    const { studentArray, last_updated, description, type } = getOr({}, 'body')(
        req,
    )

    const { authorization } = getOr({}, 'headers')(req)
    const token = flow(
        split(' '),
        splitted => splitted[1],
    )(authorization)

    return findOne('User', { token }).then(resUser => {
        if (resUser) {
            const { dataValues } = resUser
            const { id: school_id } = dataValues

            return createOne('Announcement', {
                school_id,
                last_updated,
                type,
                last_updated,
            }).then(announcement => {
                const { id: anouncement_id } = announcement
                const array = map(studentArray, function() {
                    return {
                        student_id: student_id,
                        anouncement_id: anouncement_id,
                    }
                })
                return createMutiple('Notify', array).then(notify => {
                    return res.status(200).json({ status: 200, data: notify })
                })
            })
        } else {
            return res
                .status(200)
                .json({ status: 404, data: { message: 'User Not found' } })
        }
    })
}

function createLeave(req, res, next) {
    const { from_date, to_date, student_id } = getOr({}, 'body')(req)
    return findOne('Leaves', { from_date, to_date, student_id }).then(
        resLeave => {
            if (resLeave) {
                return createOne('Leaves', {
                    from_date,
                    to_date,
                    student_id,
                }).then(Leave => {
                    return res.status(200).json({ status: 200, data: Leave })
                })
            }
            return res.status(200).json({
                status: 302,
                data: { message: 'Leave Already Exists' },
            })
        },
    )
}
function createDriver(req, res, next) {
    const { username, password, fullname, phone_no, status, photo } = getOr(
        {},
        'body',
    )(req)
    const { authorization } = getOr({}, 'headers')(req)
    const token = flow(
        split(' '),
        splitted => splitted[1],
    )(authorization)

    return findOne('User', { token }).then(resUser => {
        if (resUser) {
            const { dataValues } = resUser
            const { id, type } = dataValues

            return findOne('User', {
                username,
                password,
            }).then(resUser => {
                if (!resUser) {
                    const token = jwt.sign({ username }, config.jwtSecret)
                    const user = { username, password, type: 3, token }
                    const driver = {
                        fullname,
                        phone_no,
                        status,
                        school_id: id,
                        photo,
                    }
                    return createOne('User', user)
                        .then(savedUser => {
                            const { dataValues } = savedUser
                            const { id: driver_id, username } = dataValues
                            return createOne('Driver', {
                                driver_id,
                                ...driver,
                            }).then(savedDriver => {
                                const { dataValues: driverValues } = savedDriver
                                return res
                                    .status(200)
                                    .json({
                                        status: 200,
                                        data: {
                                            username,
                                            ...driverValues,
                                        },
                                    })
                                    .catch(err => {
                                        destroy('User', { id: driver_id })
                                        return next(e)
                                    })
                            })
                        })
                        .catch(e => next(e))
                }

                return res.status(200).json({
                    status: 302,
                    data: { message: 'Driver Already Exists' },
                })
            })
        }
        return res
            .status(200)
            .json({ status: 400, data: { message: 'Cannot Create Driver' } })
    })
}
function createParent(req, res, next) {
    const {
        username,
        password,
        fullname,
        phone_no,
        address,
        email,
        lat,
        lng,
        status,
        photo,
    } = getOr({}, 'body')(req)
    const { authorization } = getOr({}, 'headers')(req)
    const token = flow(
        split(' '),
        splitted => splitted[1],
    )(authorization)

    return findOne('User', { token }).then(resUser => {
        if (resUser) {
            const { dataValues } = resUser
            const { id, type } = dataValues

            return findOne('User', {
                username,
                password,
            }).then(resUser => {
                if (!resUser) {
                    const token = jwt.sign({ username }, config.jwtSecret)
                    const user = { username, password, type: 4, token }
                    const parent = {
                        fullname,
                        phone_no,
                        address,
                        email,
                        lat,
                        lng,
                        status,
                        school_id: id,
                        photo,
                    }
                    return createOne('User', user)
                        .then(savedUser => {
                            const { dataValues } = savedUser
                            const { id: parent_id, username } = dataValues
                            return createOne('Parent', {
                                parent_id,
                                ...parent,
                            }).then(savedParent => {
                                const { dataValues: parentValues } = savedParent
                                return res
                                    .status(200)
                                    .json({
                                        status: 200,
                                        data: {
                                            username,
                                            ...parentValues,
                                        },
                                    })
                                    .catch(err => {
                                        destroy('User', {
                                            id: parent_id,
                                        })
                                        return next(e)
                                    })
                            })
                        })
                        .catch(e => next(e))
                }

                return res.status(200).json({
                    status: 302,
                    data: { message: 'Parent Already Exists' },
                })
            })
        }
        return res
            .status(200)
            .json({ status: 400, data: { message: 'Cannot Create Parent' } })
    })
}
function createGrade(req, res, next) {
    const { grade_name, section } = getOr({}, 'body')(req)
    const { authorization } = getOr({}, 'headers')(req)
    const token = flow(
        split(' '),
        splitted => splitted[1],
    )(authorization)
    return findOne('User', { token }).then(resUser => {
        if (resUser) {
            const { dataValues } = resUser
            const { id, type } = dataValues
            const grade_section = `${grade_name + section}`
            return findOne('Grade', { grade_name, section }).then(resGrade => {
                if (!resGrade) {
                    return createOne('Grade', {
                        grade_name,
                        section,
                        grade_section,
                        school_id: id,
                    }).then(grade => {
                        return res
                            .status(200)
                            .json({ status: 200, data: grade })
                    })
                }

                return res.status(200).json({
                    status: 302,
                    data: { message: 'Grade Already Exists' },
                })
            })
        }
        return res
            .status(200)
            .json({ status: 400, data: { message: 'Cannot Create Grade' } })
    })
}
function createShift(req, res, next) {
    const { shift_name, start_time, end_time } = getOr({}, 'body')(req)
    const { authorization } = getOr({}, 'headers')(req)
    const token = flow(
        split(' '),
        splitted => splitted[1],
    )(authorization)
    return findOne('User', { token }).then(resUser => {
        if (resUser) {
            const { dataValues } = resUser
            const { id, type } = dataValues
            return findOne('Shift', {
                shift_name,
                start_time,
                end_time,
                school_id: id,
            }).then(resShift => {
                if (!resShift) {
                    return createOne('Shift', {
                        shift_name,
                        start_time,
                        end_time,
                        school_id: id,
                    }).then(shift => {
                        return res
                            .status(200)
                            .json({ status: 200, data: shift })
                    })
                }

                return res.status(200).json({
                    status: 302,
                    data: { message: 'Shift Already Exists' },
                })
            })
        }
        return res
            .status(200)
            .json({ status: 400, data: { message: 'Cannot Create Shift' } })
    })
}

//Delete funtions
function deleteBus(req, res, next) {
    const { id } = getOr({}, 'params')(req)
    return destroy('Bus', { id }).then(() =>
        res.status(200).json({ status: 200, data: { message: 'Bus Deleted' } }),
    )
}
function deleteLeave(req, res, next) {
    const { id } = getOr({}, 'params')(req)
    return destroy('Leaves', { id }).then(() =>
        res
            .status(200)
            .json({ status: 200, data: { message: 'Leave Deleted' } }),
    )
}
function deleteShift(req, res, next) {
    const { id } = getOr({}, 'params')(req)
    return destroy('Shift', { shift_id: id }).then(() =>
        res
            .status(200)
            .json({ status: 200, data: { message: 'Shift Deleted' } }),
    )
}
function deleteGrade(req, res, next) {
    const { id } = getOr({}, 'params')(req)
    return destroy('Grade', {
        grade_id: id,
    }).then(() =>
        res
            .status(200)
            .json({ status: 200, data: { message: 'Grade Deleted' } }),
    )
}
function deleteStudent(req, res, next) {
    const { id } = getOr({}, 'params')(req)
    return destroy('Student', { id }).then(() =>
        res
            .status(200)
            .json({ status: 200, data: { message: 'Student Deleted' } }),
    )
}
function deleteDriver(req, res, next) {
    const { id } = getOr({}, 'params')(req)
    return destroy('Bus', { driver_id: id }).then(() => {
        return destroy('Driver', { driver_id: id }).then(() => {
            return destroy('User', {
                id,
            }).then(() =>
                res
                    .status(200)
                    .json({ status: 200, data: { message: 'Driver Deleted' } }),
            )
        })
    })
}
function deleteParent(req, res, next) {
    const { id } = getOr({}, 'params')(req)
    return destroy('Parent', { parent_id: id }).then(() => {
        return destroy('User', { id }).then(() =>
            res
                .status(200)
                .json({ status: 200, data: { message: 'Parent Deleted' } }),
        )
    })
}

//Update funtions
function updateBus(req, res, next) {
    const newData = getOr({}, 'body')(req)
    const { id } = getOr({}, 'params')(req)
    return update('Bus', { id }, newData).then(bus =>
        res.status(200).json({ status: 200, data: bus }),
    )
}

function updateLeave(req, res, next) {
    const newData = getOr({}, 'body')(req)
    const { id } = getOr({}, 'params')(req)
    return update('Leaves', { id }, newData).then(leave =>
        res.status(200).json({ status: 200, data: leave }),
    )
}
function updateAnnouncement(req, res, next) {
    const newData = getOr({}, 'body')(req)
    const { id } = getOr({}, 'params')(req)
    return update('Announcements', { id }, newData).then(announcement =>
        res.status(200).json({ status: 200, data: announcement }),
    )
}
function updateGrade(req, res, next) {
    const newData = getOr({}, 'body')(req)
    const { id } = getOr({}, 'params')(req)
    return update('Grade', { grade_id: id }, newData).then(grade =>
        res.status(200).json({ status: 200, data: grade }),
    )
}
function updateShift(req, res, next) {
    const newData = getOr({}, 'body')(req)
    const { id } = getOr({}, 'params')(req)
    return update('Shift', { shift_id: id }, newData).then(shift =>
        res.status(200).json({ status: 200, data: shift }),
    )
}
function updateStudent(req, res, next) {
    const newData = getOr({}, 'body')(req)
    const { id } = getOr({}, 'params')(req)
    return update('Student', { id }, newData).then(student =>
        res.status(200).json({ status: 200, data: student }),
    )
}
function updateDriver(req, res, next) {
    const newData = getOr({}, 'body')(req)
    const { id } = getOr({}, 'params')(req)
    return update('Driver', { driver_id: id }, newData).then(driver =>
        res.status(200).json({ status: 200, data: driver }),
    )
}
function updateParent(req, res, next) {
    const newData = getOr({}, 'body')(req)
    const { id } = getOr({}, 'params')(req)
    return update('Parent', { parent_id: id }, newData).then(parent =>
        res.status(200).json({ status: 200, data: parent }),
    )
}

//Get funtions
function getBus(req, res, next) {
    const { id } = getOr({}, 'params')(req)
    return findOne('Bus', { id }).then(bus =>
        res.status(200).json({ status: 200, data: bus }),
    )
}
function getLeave(req, res, next) {
    const { id } = getOr({}, 'params')(req)
    return findOne('Leaves', { id }).then(leave =>
        res.status(200).json({ status: 200, data: leave }),
    )
}
function getAnnouncement(req, res, next) {
    const { id } = getOr({}, 'params')(req)
    return findOne('Annoucement', { id }).then(announcement =>
        res.status(200).json({ status: 200, data: announcement }),
    )
}
function getShift(req, res, next) {
    const { id } = getOr({}, 'params')(req)
    return findOne('Shift', { shift_id: id }).then(shift =>
        res.status(200).json({ status: 200, data: shift }),
    )
}
function getGrade(req, res, next) {
    const { id } = getOr({}, 'params')(req)
    return findOne('Grade', {
        grade_id: id,
    }).then(grade => res.status(200).json({ status: 200, data: grade }))
}
function getStudent(req, res, next) {
    const { id } = getOr({}, 'params')(req)
    return findOne('Student', { id }).then(student =>
        res.status(200).json({ status: 200, data: student }),
    )
}
function getDriver(req, res, next) {
    const { id } = getOr({}, 'params')(req)
    return findOne('Driver', {
        driver_id: id,
    }).then(driver => res.status(200).json({ status: 200, data: driver }))
}
function getParent(req, res, next) {
    const { id } = getOr({}, 'params')(req)
    return findOne('Parent', {
        parent_id: id,
    }).then(parent => res.status(200).json({ status: 200, data: parent }))
}

//getList funtions
function busList(req, res, next) {
    const { authorization } = getOr({}, 'headers')(req)
    const token = flow(
        split(' '),
        splitted => splitted[1],
    )(authorization)

    return findOne('User', { token }).then(resUser => {
        if (resUser) {
            const { dataValues } = resUser
            const { id, type } = dataValues

            return findAcross('Bus', { school_id: id }, 'Driver').then(bus =>
                res.status(200).json({ status: 200, data: bus }),
            )
        }
        return res
            .status(200)
            .json({ status: 404, data: { message: 'No Buses Found' } })
    })
}
function gradeList(req, res, next) {
    const { authorization } = getOr({}, 'headers')(req)
    const token = flow(
        split(' '),
        splitted => splitted[1],
    )(authorization)

    return findOne('User', { token }).then(resUser => {
        if (resUser) {
            const { dataValues } = resUser
            const { id, type } = dataValues

            return findAcross('Grade', { school_id: id }).then(grade =>
                res.status(200).json({ status: 200, data: grade }),
            )
        }
        return res
            .status(200)
            .json({ status: 404, data: { message: 'No Grades Found' } })
    })
}
function shiftList(req, res, next) {
    const { authorization } = getOr({}, 'headers')(req)
    const token = flow(
        split(' '),
        splitted => splitted[1],
    )(authorization)

    return findOne('User', { token }).then(resUser => {
        if (resUser) {
            const { dataValues } = resUser
            const { id, type } = dataValues

            return findAcross('Shift', { school_id: id }).then(shift =>
                res.status(200).json({ status: 200, data: shift }),
            )
        }
        return res
            .status(200)
            .json({ status: 404, data: { message: 'No Shifts Found' } })
    })
}
function studentList(req, res, next) {
    const { authorization } = getOr({}, 'headers')(req)
    const token = flow(
        split(' '),
        splitted => splitted[1],
    )(authorization)

    return findOne('User', { token }).then(resUser => {
        if (resUser) {
            const { dataValues } = resUser
            const { id, type } = dataValues
            //verify it
            return findAcross('Student', { school_id: id }, 'Parent').then(
                student => res.status(200).json({ status: 200, data: student }),
            )
        }
        return res
            .status(200)
            .json({ status: 404, data: { message: 'No Students Found' } })
    })
}
function driverBusList(req, res, next) {
    const { id } = getOr({}, 'params')(req)
    return findMultiple('Bus', { driver_id: id }).then(bus =>
        res.status(200).json({ status: 200, data: bus }),
    )
}
function studentNotificationList(req, res, next) {
    const { id } = getOr({}, 'params')(req)
    return findMultiple('Notify', { student_id: id }).then(notify =>
        res.status(200).json({ status: 200, data: notify }),
    )
}
function studentLeaveList(req, res, next) {
    const { id } = getOr({}, 'params')(req)
    return findMultiple('Leaves', { student_id: id }).then(leave =>
        res.status(200).json({ status: 200, data: leave }),
    )
}
function parentStudentList(req, res, next) {
    const { id } = getOr({}, 'params')(req)
    return findMultiple('Student', { parent_id: id }).then(student =>
        res.status(200).json({ status: 200, data: student }),
    )
}
function driverList(req, res, next) {
    const { authorization } = getOr({}, 'headers')(req)
    const token = flow(
        split(' '),
        splitted => splitted[1],
    )(authorization)

    return findOne('User', { token }).then(resUser => {
        const { dataValues } = resUser
        const { id } = dataValues
        return findOne('User', { token }).then(resUser => {
            if (resUser) {
                const { dataValues } = resUser
                const { id } = dataValues
                return findMultiple('Driver', {
                    school_id: id,
                }).then(driver =>
                    res.status(200).json({ status: 200, data: driver }),
                )
            }
            return res.status(200).json({
                status: 404,
                data: { message: 'No Driver Accounts Founds' },
            })
        })
    })
}
function parentList(req, res, next) {
    const { authorization } = getOr({}, 'headers')(req)
    const token = flow(
        split(' '),
        splitted => splitted[1],
    )(authorization)

    return findOne('User', { token }).then(resUser => {
        if (resUser) {
            const { dataValues } = resUser
            const { id } = dataValues
            return findMultiple('Parent', {
                school_id: id,
            }).then(parent =>
                res.status(200).json({ status: 200, data: parent }),
            )
        }
        return res.status(200).json({
            status: 404,
            data: { message: 'No Parents Accounts Founds' },
        })
    })
}

export default {
    createBus,
    createNotification,
    createLeave,
    createGrade,
    createShift,
    createStudent,
    createDriver,
    createParent,
    deleteBus,
    deleteLeave,
    deleteShift,
    deleteGrade,
    deleteStudent,
    deleteDriver,
    deleteParent,
    updateDriver,
    updateLeave,
    updateAnnouncement,
    updateBus,
    updateShift,
    updateGrade,
    updateStudent,
    updateParent,
    getBus,
    getAnnouncement,
    getLeave,
    getShift,
    getGrade,
    getDriver,
    getParent,
    getStudent,
    busList,
    shiftList,
    gradeList,
    studentList,
    driverBusList,
    parentStudentList,
    studentNotificationList,
    studentLeaveList,
    driverList,
    parentList,
}
