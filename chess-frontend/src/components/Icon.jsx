export default function Icon(props) {
  return (
    <span
      class={props.class || ''}
      style={{
        display: 'inline-flex',
        width: props.size || '20px',
        height: props.size || '20px',
        'align-items': 'center',
        'justify-content': 'center',
        ...props.style,
      }}
      innerHTML={typeof props.svg === 'function' ? props.svg() : props.svg}
    />
  );
}
