const { validationResult } = require('express-validator');
const roleModel = require('../models/role_model');

const roleController = {
  getRoles: async (req, res) => {
    try {
      const role = await roleModel.getRoles();
      return res.status(200).render('roles', { role });
    } catch (error) {
      console.error(`Get role list error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  getRoleCreate: async (req, res) => {
    try {
      return res.status(200).render('role_create');
    } catch (error) {
      console.error(`Get role create error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  postRole: async (req, res) => {
    try {
      const { roleId } = req.params;
      const { name, description } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash('error_messages', 'All fields are required');
        if (roleId) {
          return res.status(301).redirect(`/admin/roles/${roleId}`);
        }
        return res.status(301).redirect(`/admin/roles/create`);
      }
      await roleModel.postRole(roleId, name, description);
      return res.status(301).redirect('/admin/roles');
    } catch (error) {
      console.error(`Post role error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  getRole: async (req, res) => {
    try {
      const { roleId } = req.params;
      const role = await roleModel.getRole(roleId);
      if (!role) {
        return res.status(301).redirect('/admin/roles');
      }
      return res.status(200).render('role_create', { role });
    } catch (error) {
      console.error(`Get role error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },

  deleteRole: async (req, res) => {
    const { roleId } = req.params;
    try {
      await roleModel.deleteRole(roleId);
      return res.status(301).redirect('/admin/roles');
    } catch (error) {
      console.error(`Delete role error: ${error}`);
      return res.status(500).send('Internal Server Error');
    }
  },
};

module.exports = roleController;
