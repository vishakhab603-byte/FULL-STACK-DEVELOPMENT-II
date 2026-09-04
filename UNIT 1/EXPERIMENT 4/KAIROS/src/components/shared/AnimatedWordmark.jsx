function AnimatedWordmark({ text = "KAIROS", size = 20 }) {
    return (<div className="wordmark wordmark-animated" style={{ fontSize: size }}>
      {text.split("").map((ch, i) => (<span key={i} className="wordmark-letter" style={{ transitionDelay: (i * 0.035) + "s" }}>{ch}</span>))}
    </div>);
}

export { AnimatedWordmark };
