import express from 'express';
import ArticleController from '../controllers/articleController.js';

const controller = new ArticleController();
const router = express.Router();

router.route('/')
  .get(controller.getAll)
  .post(controller.create);

router.route('/:id')
  .get(controller.getById)
  .put(controller.update)
  .delete(controller.delete);

router.route('/:id/lock')
  .post(controller.lock)
  .delete(controller.unlock);

router.post('/:id/publish', controller.publish);
router.post('/:id/unpublish', controller.unpublish);
router.post('/:id/archive', controller.archive);

export default router;
