import { useState } from "react";
import { create } from "zustand";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { arrayMove } from "@dnd-kit/sortable";
import Switch from "@mui/material/Switch";

const useCalculatorStore = create((set) => ({
  components: [
    "7",
    "8",
    "9",
    "+",
    "4",
    "5",
    "6",
    "-",
    "1",
    "2",
    "3",
    "*",
    "0",
    "C",
    "=",
    "/",
  ],
  setComponents: (components) => set({ components }),
}));

const SortableItem = ({ id, onClick, children, darkMode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: "none", // Prevents touch issues
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-md text-center cursor-pointer select-none ${
        darkMode ? "bg-white text-black" : "bg-gray-700 text-white"
      }`}
      {...attributes}
      {...listeners}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick(id);
      }}
    >
      {children}
    </div>
  );
};

export default function CalculatorBuilder() {
  const { components, setComponents } = useCalculatorStore();
  const [expression, setExpression] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  // **This is the main fix**
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = components.indexOf(active.id);
    const newIndex = components.indexOf(over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      setComponents(arrayMove(components, oldIndex, newIndex));
    }
  };

  const label = { inputProps: { "aria-label": "Switch demo" } };

  const handleClick = (value) => {
    if (value === "C") {
      setExpression("");
    } else if (value === "=") {
      try {
        setExpression(eval(expression).toString());
      } catch {
        setExpression("Error");
      }
    } else {
      setExpression((prev) => prev + value);
    }
  };

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center ${
        darkMode ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <div
        className={`p-6 w-96 rounded-xl shadow-md ${
          darkMode ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        <button
          className="mb-4 text-white  "
          onClick={() => setDarkMode(!darkMode)}
        >
          <Switch
            {...label}
            defaultChecked
            sx={{
              "& .MuiSwitch-thumb": { backgroundColor: "#808080" },
              "& .MuiSwitch-track": { backgroundColor: "#808080" },
            }}
          />
        </button>
        <div className="p-4 mb-4 text-xl text-right bg-gray-800 rounded-md">
          {expression || "0"}
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={components}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-4 gap-2">
              {components.map((item) => (
                <SortableItem
                  key={item}
                  id={item}
                  onClick={() => handleClick(item)}
                  darkMode={darkMode}
                >
                  {item}
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
