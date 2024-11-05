const UserModel = require('../modeles/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailServiсe = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');

class UserService {
  async registration(email, password) {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw new Error(`Пользователь с таким ${email} уже существует`);
    }
    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuid.v4();
    const user = await UserModel.create({ email, password: hashPassword, activationLink });
    const userDto = new UserDto(user);
    await mailServiсe.sendActivationmail(
      email,
      `${process.env.API_URL}/api/activate/activationLink`,
    );
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return {
      ...tokens,
      user: userDto,
    };
  }
}
module.exports = new UserService();
