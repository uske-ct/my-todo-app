"use client";

import { useState, DragEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Task, User, Comment } from "@/types/auth";

interface TodoAppProps {
  user: User;
}

export function TodoApp({ user }: TodoAppProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [nextId, setNextId] = useState(1);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const TASKS_STORAGE_KEY = `todo-tasks-${user.id}`;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      if (storedTasks) {
        const parsedTasks: Task[] = JSON.parse(storedTasks);
        // Migrate old tasks without comments property
        const migratedTasks = parsedTasks.map(task => ({
          ...task,
          comments: task.comments || []
        }));
        setTasks(migratedTasks);
        if (migratedTasks.length > 0) {
          const maxId = Math.max(...migratedTasks.map(task => task.id));
          setNextId(maxId + 1);
        }
        // Save migrated data back to localStorage if migration occurred
        if (migratedTasks.some((task, index) => !parsedTasks[index].comments)) {
          localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(migratedTasks));
        }
      }
    }
  }, [TASKS_STORAGE_KEY]);

  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
  };

  const addTask = () => {
    if (inputValue.trim() !== "") {
      const newTask: Task = {
        id: nextId,
        text: inputValue.trim(),
        completed: false,
        userId: user.id,
        comments: [],
      };
      const updatedTasks = [...tasks, newTask];
      saveTasks(updatedTasks);
      setInputValue("");
      setNextId(nextId + 1);
    }
  };

  const addComment = (taskId: number, content: string) => {
    if (content.trim() === "") return;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      content: content.trim(),
      authorId: user.id,
      authorName: user.name,
      createdAt: new Date().toISOString(),
    };

    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, comments: [...task.comments, newComment] }
        : task
    );
    saveTasks(updatedTasks);
  };

  const toggleTask = (id: number) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks(updatedTasks);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  const handleDragStart = (e: DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: DragEvent, targetCompleted: boolean) => {
    e.preventDefault();
    if (draggedTask && draggedTask.completed !== targetCompleted) {
      const updatedTasks = tasks.map(task => 
        task.id === draggedTask.id 
          ? { ...task, completed: targetCompleted } 
          : task
      );
      saveTasks(updatedTasks);
    }
    setDraggedTask(null);
  };

  const incompleteTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const TaskCard = ({ task }: { task: Task }) => {
    const [commentInput, setCommentInput] = useState("");

    const handleAddComment = () => {
      if (commentInput.trim()) {
        addComment(task.id, commentInput);
        setCommentInput("");
      }
    };

    const handleCommentKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddComment();
      }
    };

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, task)}
        className="group p-4 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-move hover:scale-[1.02]"
      >
        {/* Task content */}
        <div className="flex items-start gap-3 mb-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => toggleTask(task.id)}
            id={`task-${task.id}`}
            className="mt-0.5"
          />
          <label
            htmlFor={`task-${task.id}`}
            className={`flex-1 cursor-pointer text-sm leading-relaxed ${
              task.completed
                ? "line-through text-muted-foreground"
                : "text-foreground"
            }`}
          >
            {task.text}
          </label>
        </div>

        {/* Comments section */}
        <div className="border-t border-border pt-3 space-y-3">
          {/* Comments list */}
          <div className="space-y-2">
            {task.comments.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">コメントはありません</p>
            ) : (
              task.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-muted/50 p-2 rounded text-xs space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {comment.authorName}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                  <p className="text-foreground leading-relaxed">{comment.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Comment input */}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="コメントを追加..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyPress={handleCommentKeyPress}
              className="flex-1 text-xs h-8"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleAddComment();
              }}
              disabled={!commentInput.trim()}
              className="h-8 px-2 text-xs"
            >
              追加
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const Column = ({ 
    title, 
    tasks: columnTasks, 
    completed, 
    bgColor, 
    textColor,
    count 
  }: { 
    title: string; 
    tasks: Task[]; 
    completed: boolean;
    bgColor: string;
    textColor: string;
    count: number;
  }) => (
    <div className="flex-1 min-h-[400px]">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <Badge variant="secondary" className={`${bgColor} ${textColor}`}>
          {count}
        </Badge>
      </div>
      <div
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, completed)}
        className="min-h-[350px] p-4 bg-muted/30 border-2 border-dashed border-border rounded-lg space-y-3 transition-colors hover:bg-muted/50"
      >
        {columnTasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            {completed ? "完了したタスクがここに表示されます" : "タスクをここにドラッグ"}
          </div>
        ) : (
          columnTasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            カンバンボード
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              type="text"
              placeholder="新しいタスクを入力..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={addTask} disabled={!inputValue.trim()}>
              追加
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Column
          title="未完了"
          tasks={incompleteTasks}
          completed={false}
          bgColor="bg-blue-100"
          textColor="text-blue-800"
          count={incompleteTasks.length}
        />
        <Column
          title="完了済み"
          tasks={completedTasks}
          completed={true}
          bgColor="bg-green-100"
          textColor="text-green-800"
          count={completedTasks.length}
        />
      </div>
    </div>
  );
}