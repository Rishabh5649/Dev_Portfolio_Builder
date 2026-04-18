import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff } from 'lucide-react';

const SortableItem = ({ id, label, isHidden, onToggleHide }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 mb-2 bg-white border rounded-md shadow-sm 
        ${isDragging ? 'ring-2 ring-indigo-500 border-transparent shadow-lg' : 'border-gray-200'}
        ${isHidden ? 'opacity-60 bg-gray-50' : ''}
      `}
    >
      <div className="flex items-center">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mr-3 text-gray-400 hover:text-gray-600">
          <GripVertical className="h-5 w-5" />
        </div>
        <span className={`font-medium ${isHidden ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{label}</span>
      </div>
      <button
        onClick={() => onToggleHide(id)}
        className="text-gray-400 hover:text-indigo-600 transition-colors p-1"
        title={isHidden ? "Show section" : "Hide section"}
      >
        {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};

const SectionReorder = ({ sections, sectionLabels, hiddenSections, onChangeOrder, onChangeHidden }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.indexOf(active.id);
      const newIndex = sections.indexOf(over.id);
      onChangeOrder(arrayMove(sections, oldIndex, newIndex));
    }
  };

  const handleToggleHide = (sectionId) => {
    if (hiddenSections.includes(sectionId)) {
      onChangeHidden(hiddenSections.filter(id => id !== sectionId));
    } else {
      onChangeHidden([...hiddenSections, sectionId]);
    }
  };

  return (
    <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Section Order (Drag to reorder)</h3>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections} strategy={verticalListSortingStrategy}>
          {sections.map((sectionId) => (
            <SortableItem
              key={sectionId}
              id={sectionId}
              label={sectionLabels[sectionId] || sectionId}
              isHidden={hiddenSections.includes(sectionId)}
              onToggleHide={handleToggleHide}
            />
          ))}
        </SortableContext>
      </DndContext>
      <p className="text-xs text-gray-500 mt-3 flex items-center">
        <EyeOff className="w-3 h-3 mr-1 inline" /> Hidden sections will not appear in the exported PDF/DOCX.
      </p>
    </div>
  );
};

export default SectionReorder;
