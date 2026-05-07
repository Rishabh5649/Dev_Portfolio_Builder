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
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px', marginBottom: '8px', background: isDragging ? 'var(--accent-dim)' : 'var(--bg-surface)',
        border: '1px solid ' + (isDragging ? 'var(--accent)' : 'var(--border)'),
        borderRadius: 'var(--radius-sm)', boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
        opacity: isHidden ? 0.6 : 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div {...attributes} {...listeners} style={{
            cursor: 'grab', marginRight: '12px', color: 'var(--text-muted)',
            padding: '4px', transition: 'all 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <GripVertical size={18} />
          </div>
          <span style={{
            fontWeight: 500,
            color: isHidden ? 'var(--text-muted)' : 'var(--text-primary)',
            textDecoration: isHidden ? 'line-through' : 'none'
          }}>{label}</span>
        </div>
        <button
          onClick={() => onToggleHide(id)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '4px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          title={isHidden ? "Show section" : "Hide section"}
        >
          {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
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
    <div style={{
      marginBottom: '24px', background: 'var(--bg-surface)', padding: '16px',
      borderRadius: 'var(--radius-md)', border: '1px solid var(--border)'
    }}>
      <h3 style={{
        fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)',
        marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px 0'
      }}>Section Order (Drag to reorder)</h3>
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
      <p style={{
        fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px',
        display: 'flex', alignItems: 'center', gap: '6px', margin: '12px 0 0 0'
      }}>
        <EyeOff size={14} /> Hidden sections will not appear in the exported PDF/DOCX.
      </p>
    </div>
  );
};

export default SectionReorder;
