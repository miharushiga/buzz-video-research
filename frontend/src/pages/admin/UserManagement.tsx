/**
 * ユーザー管理ページ - バズ動画リサーチくん
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Chip,
  IconButton,
  CircularProgress,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { useAuthStore } from '../../stores/authStore';

interface User {
  id: string;
  email: string;
  full_name?: string;
  is_admin: boolean;
  created_at: string;
  subscription_status?: string;
  trial_end?: string;
  current_period_end?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8433';

export const UserManagement = () => {
  const navigate = useNavigate();
  const { session } = useAuthStore();

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 編集ダイアログ
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async () => {
    if (!session?.access_token) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        per_page: String(rowsPerPage),
      });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`${API_BASE_URL}/api/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('ユーザー一覧の取得に失敗しました');
      }

      const data = await response.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [session, page, rowsPerPage, statusFilter]);

  const handleSearch = () => {
    setPage(0);
    fetchUsers();
  };

  const handleEditOpen = (user: User) => {
    setEditUser(user);
    setEditIsAdmin(user.is_admin);
  };

  const handleEditClose = () => {
    setEditUser(null);
  };

  const handleEditSave = async () => {
    if (!editUser || !session?.access_token) return;

    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${editUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ is_admin: editIsAdmin }),
      });

      if (!response.ok) {
        throw new Error('更新に失敗しました');
      }

      // リスト更新
      setUsers(users.map(u =>
        u.id === editUser.id ? { ...u, is_admin: editIsAdmin } : u
      ));
      handleEditClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusChip = (status?: string) => {
    switch (status) {
      case 'active':
        return <Chip label="有料" size="small" color="success" />;
      case 'trialing':
        return <Chip label="トライアル" size="small" color="info" />;
      case 'cancelled':
        return <Chip label="キャンセル済" size="small" color="warning" />;
      case 'expired':
        return <Chip label="期限切れ" size="small" color="error" />;
      default:
        return <Chip label="なし" size="small" variant="outlined" />;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ja-JP');
  };

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/admin')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight={600}>
          ユーザー管理
        </Typography>
      </Box>

      {/* エラー表示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* フィルター */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="メールアドレスまたは名前で検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>ステータス</InputLabel>
            <Select
              value={statusFilter}
              label="ステータス"
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">すべて</MenuItem>
              <MenuItem value="active">有料</MenuItem>
              <MenuItem value="trialing">トライアル</MenuItem>
              <MenuItem value="cancelled">キャンセル済</MenuItem>
              <MenuItem value="expired">期限切れ</MenuItem>
              <MenuItem value="none">なし</MenuItem>
            </Select>
          </FormControl>

          <Button variant="outlined" onClick={handleSearch}>
            検索
          </Button>
        </Box>
      </Paper>

      {/* テーブル */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>メールアドレス</TableCell>
              <TableCell>名前</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell>登録日</TableCell>
              <TableCell>管理者</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  ユーザーが見つかりません
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.full_name || '-'}</TableCell>
                  <TableCell>{getStatusChip(user.subscription_status)}</TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>
                    {user.is_admin && <Chip label="管理者" size="small" color="primary" />}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEditOpen(user)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
          labelRowsPerPage="表示件数"
        />
      </TableContainer>

      {/* 編集ダイアログ */}
      <Dialog open={!!editUser} onClose={handleEditClose}>
        <DialogTitle>ユーザー編集</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              メールアドレス: {editUser?.email}
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={editIsAdmin}
                  onChange={(e) => setEditIsAdmin(e.target.checked)}
                />
              }
              label="管理者権限"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>キャンセル</Button>
          <Button onClick={handleEditSave} variant="contained" disabled={isSaving}>
            {isSaving ? <CircularProgress size={20} /> : '保存'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
