'use client';

import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { useCategories } from '@/features/metadata/hooks/use-categories';
import { useDifficulties } from '@/features/metadata/hooks/use-difficulties';
import { useCreateCategory } from '@/features/metadata/hooks/use-create-category';
import { useToggleCategory } from '@/features/metadata/hooks/use-toggle-category';
import { useCreateDifficulty } from '@/features/metadata/hooks/use-create-difficulty';
import { useToggleDifficulty } from '@/features/metadata/hooks/use-toggle-difficulty';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export default function MetadataPage() {
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [difficultyDialogOpen, setDifficultyDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newDifficultyName, setNewDifficultyName] = useState('');

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: difficulties, isLoading: difficultiesLoading } = useDifficulties();

  const createCategory = useCreateCategory();
  const toggleCategory = useToggleCategory();
  const createDifficulty = useCreateDifficulty();
  const toggleDifficulty = useToggleDifficulty();

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await createCategory.mutateAsync({ name: newCategoryName });
      setNewCategoryName('');
      setCategoryDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateDifficulty = async () => {
    if (!newDifficultyName.trim()) return;
    try {
      await createDifficulty.mutateAsync({ name: newDifficultyName });
      setNewDifficultyName('');
      setDifficultyDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (categoriesLoading || difficultiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>카테고리 관리</CardTitle>
          <Button onClick={() => setCategoryDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            카테고리 추가
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>활성화</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>
                    <Badge variant={category.active ? 'default' : 'secondary'}>
                      {category.active ? '활성' : '비활성'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={category.active}
                      onCheckedChange={() => toggleCategory.mutate(category.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>난이도 관리</CardTitle>
          <Button onClick={() => setDifficultyDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            난이도 추가
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>활성화</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {difficulties?.map((difficulty) => (
                <TableRow key={difficulty.id}>
                  <TableCell>{difficulty.name}</TableCell>
                  <TableCell>
                    <Badge variant={difficulty.active ? 'default' : 'secondary'}>
                      {difficulty.active ? '활성' : '비활성'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={difficulty.active}
                      onCheckedChange={() => toggleDifficulty.mutate(difficulty.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 카테고리 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="카테고리 이름"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <Button onClick={handleCreateCategory} className="w-full">
              추가
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={difficultyDialogOpen} onOpenChange={setDifficultyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 난이도 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="난이도 이름"
              value={newDifficultyName}
              onChange={(e) => setNewDifficultyName(e.target.value)}
            />
            <Button onClick={handleCreateDifficulty} className="w-full">
              추가
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
