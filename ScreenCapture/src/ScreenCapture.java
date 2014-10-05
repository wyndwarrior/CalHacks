import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

/**
 * Created by Raymond on 10/4/2014.
 */
public class ScreenCapture {
    public static void main(String[] args) {
        if(args.length != 1) {
            System.err.println("Incorrect number of arguments!");
            return;
        }
        Robot robot;
        try {
            robot = new Robot();
        } catch (AWTException e) {
            e.printStackTrace();
            return;
        }
        Dimension dimension = Toolkit.getDefaultToolkit().getScreenSize();
        Rectangle screen = new Rectangle(dimension);
        BufferedImage screenshot = robot.createScreenCapture(screen);
        try {
            ImageIO.write(screenshot, "jpg", new File(args[0]));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
