require('dotenv').config();
const roleModel = require('../models/role_model');

const roleController = {
  getRoles: async (req, res) => {
    try {
      const role = await roleModel.getRoles();
      return res.render('roles', { role });
    } catch (error) {
      console.error(`Get role list error: ${error}`);
    }
  },

  getRoleCreate: async (req, res) => {
    try {
      return res.render('role_create');
    } catch (error) {
      console.error(`Get role create error: ${error}`);
    }
  },

  postRole: async (req, res) => {
    try {
      const { roleId } = req.params;
      const { name, description } = req.body;
      await roleModel.postRole(roleId, name, description);
      return res.redirect('/admin/roles');
    } catch (error) {
      console.error(`Post role error: ${error}`);
    }
  },

  getRole: async (req, res) => {
    try {
      const { roleId } = req.params;
      const role = await roleModel.getRole(roleId);
      return res.render('role_create', { role });
    } catch (error) {
      console.error(`Get role error: ${error}`);
    }
  },

  deleteRole: async (req, res) => {
    const { roleId } = req.params;
    try {
      await roleModel.deleteRole(roleId);
      return res.redirect('/admin/roles');
    } catch (error) {
      console.error(`Delete role error: ${error}`);
    }
  },
};

module.exports = roleController;
