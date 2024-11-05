const UserModele = require('../modeles/user-modele');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailServise = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');

class UserService {
  async registration(email, password) {
    const candidate = await UserModele.findOne({ email });
    if (candidate) {
      throw new Error(`Пользователь с такоим ${email} уже существует`);
    }
    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuid.v4();
    const user = await UserModele.create({ email, password: hashPassword, activationLink });
    const userDto = new UserDto(user);
    await mailServise.sendActivationmail(email, activationLink);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto, id, tokens.refreshToken);
    return {
      ...tokens,
      user: userDto,
    };
  }
}
module.exports = new UserService();
