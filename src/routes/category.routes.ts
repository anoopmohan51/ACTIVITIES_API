import { Router } from 'express';
import { createCategory, getCategory, updateCategory, deleteCategory, listCategoriesBySite } from '../controllers/category.controller';

const router = Router();

router.post('/', createCategory);
router.get('/site/:siteId', listCategoriesBySite);
router.get('/:id', getCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
