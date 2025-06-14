const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Reactiverse. All rights reserved.</p>
        <p className="text-sm">
          Designed with <span className="text-accent">&#x2764;</span> by the Reactiverse Team
        </p>
      </div>
    </footer>
  );
};

export default Footer;
