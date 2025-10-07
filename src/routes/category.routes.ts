import { Router } from 'express';
import { createCategory, getCategory, updateCategory, deleteCategory, listCategoriesBySite, filterCategories } from '../controllers/category.controller';

const router = Router();

router.post('/', createCategory);
router.post('/filter', filterCategories);
router.get('/site/:siteId', listCategoriesBySite);
router.get('/:id', getCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
