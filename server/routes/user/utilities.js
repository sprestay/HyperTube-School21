async function checkCompleteUserInfo(user) {
    if (!user.complete && user.username && user.lastname
        && user.avatar && user.mail)
    {
        user.complete = true;
        await user.save();
    }
}

exports.checkCompleteUserInfo = checkCompleteUserInfo;